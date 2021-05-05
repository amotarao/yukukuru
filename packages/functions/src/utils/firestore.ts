import { FirestoreDateLike, TokenData, TwUserData, UserData, WatchData } from '@yukukuru/types';
import { firestore } from '../modules/firebase';
import { TwitterClientErrorData } from '../utils/error';
import { setUserToNotActive } from './firestore/users';
import { TwitterUserInterface } from './twitter';

export const checkNoUserMatches = (errors: TwitterClientErrorData[]): boolean => {
  return errors.some(({ code }) => code === 17);
};

export const checkRateLimitExceeded = (errors: TwitterClientErrorData[]): boolean => {
  return errors.some(({ code }) => code === 88);
};

export const checkInvalidToken = (errors: TwitterClientErrorData[]): boolean => {
  return errors.some(({ code }) => code === 89);
};

export const checkProtectedUser = (errors: TwitterClientErrorData[]): boolean => {
  return errors.some(({ code }) => code === 326);
};

export const bulkWriterErrorHandler = (error: FirebaseFirestore.BulkWriterError): boolean => {
  const MAX_RETRY_ATTEMPTS = 5;

  if (error.code === FirebaseFirestore.GrpcStatus.UNAVAILABLE && error.failedAttempts < MAX_RETRY_ATTEMPTS) {
    return true;
  }
  console.error(`❗️[Error]: Failed to ${error.operationType} document for ${error.documentRef}`);
  return false;
};

export const setTokenInvalid = async (userId: string): Promise<void> => {
  const user = setUserToNotActive(userId);
  const data: Pick<TokenData, 'twitterAccessToken' | 'twitterAccessTokenSecret'> = {
    twitterAccessToken: '',
    twitterAccessTokenSecret: '',
  };
  const token = firestore.collection('tokens').doc(userId).update(data);

  await Promise.all([user, token]);
};

export const getToken = async (userId: string): Promise<TokenData | null> => {
  const tokenRef = firestore.collection('tokens').doc(userId);
  const tokenDoc = await tokenRef.get();
  if (!tokenDoc.exists) {
    return null;
  }
  const { twitterAccessToken = null, twitterAccessTokenSecret = null, twitterId = null } = tokenDoc.data() as TokenData;
  if (!twitterAccessToken || !twitterAccessTokenSecret || !twitterId) {
    return null;
  }
  return { twitterAccessToken, twitterAccessTokenSecret, twitterId };
};

export const setWatch = async (userId: string, followers: string[], date: Date, ended: boolean): Promise<string> => {
  const collection = firestore.collection('users').doc(userId).collection('watches');
  const data: WatchData<FirestoreDateLike> = {
    followers,
    getStartDate: date,
    getEndDate: date,
    ended,
  };

  const { id } = await collection.add(data);
  return id;
};

export const setUserResult = async (userId: string, watchId: string, nextCursor: string, date: Date): Promise<void> => {
  const collection = firestore.collection('users').doc(userId);
  const ended = nextCursor === '0' || nextCursor === '-1';
  const data: Pick<
    UserData<FirestoreDateLike>,
    'nextCursor' | 'currentWatchesId' | 'pausedGetFollower' | 'lastUpdated'
  > = {
    nextCursor: ended ? '-1' : nextCursor,
    currentWatchesId: ended ? '' : watchId,
    pausedGetFollower: !ended,
    lastUpdated: date,
  };

  await collection.update(data);
};

export const setUserResultWithNoChange = async (userId: string, date: Date): Promise<void> => {
  const collection = firestore.collection('users').doc(userId);
  const data: Pick<UserData<FirestoreDateLike>, 'lastUpdated'> = {
    lastUpdated: date,
  };

  await collection.update(data);
};

export const updateUserLastUpdatedTwUsers = async (userId: string, date: Date): Promise<void> => {
  const collection = firestore.collection('users').doc(userId);
  const data: Pick<UserData<FirestoreDateLike>, 'lastUpdatedTwUsers'> = {
    lastUpdatedTwUsers: date,
  };

  await collection.update(data);
};

export const existsRecords = async (userId: string): Promise<boolean> => {
  const snapshot = await firestore.collection('users').doc(userId).collection('records').limit(1).get();
  return !snapshot.empty;
};

export const setTwUsers = async (users: TwitterUserInterface[]): Promise<void> => {
  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);

  const collection = firestore.collection('twUsers');

  users.forEach(({ id_str, screen_name, name, profile_image_url_https }) => {
    const ref = collection.doc(id_str);
    const data: TwUserData = {
      id: id_str,
      screenName: screen_name,
      name,
      photoUrl: profile_image_url_https,
    };
    bulkWriter.set(ref, data, { merge: true });
  });

  await bulkWriter.close();
};

export const getTwUsers = async (users: string[]): Promise<TwUserData[]> => {
  const collection = firestore.collection('twUsers');
  const requests = users.map(async (user) => {
    const snapshot = await collection.doc(user).get();
    return snapshot;
  });
  const results = await Promise.all(requests);
  return results
    .filter((result) => {
      return result.exists;
    })
    .map((result) => {
      return result.data() as TwUserData;
    });
};
