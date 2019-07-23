import * as _ from 'lodash';
import { firestore } from '../modules/firebase';
import { TwitterClientErrorData } from '../utils/error';
import { TokenData, UserRecordData, TwUserData } from '../utils/interfaces';
import { TwitterUserInterface } from './twitter';

export const checkInvalidToken = (errors: TwitterClientErrorData[]): boolean => {
  const error = errors.find(({ code }) => code === 89);
  return error ? true : false;
};

export const checkRateLimitExceeded = (errors: TwitterClientErrorData[]): boolean => {
  const error = errors.find(({ code }) => code === 88);
  return error ? true : false;
};

export const checkProtectedUser = (errors: TwitterClientErrorData[]): boolean => {
  const error = errors.find(({ code }) => code === 326);
  return error ? true : false;
};

export const setTokenInvalid = async (userId: string): Promise<void> => {
  const user = firestore
    .collection('users')
    .doc(userId)
    .set(
      {
        invalid: true,
      },
      { merge: true }
    );
  const token = firestore
    .collection('tokens')
    .doc(userId)
    .set(
      {
        twitterAccessToken: '',
        twitterAccessTokenSecret: '',
      },
      { merge: true }
    );
  await Promise.all([user, token]);
  return;
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
  const collection = firestore
    .collection('users')
    .doc(userId)
    .collection('watches');

  const { id } = await collection.add({
    followers,
    getStartDate: date,
    getEndDate: date,
    ended,
  });
  return id;
};

export const setUserResult = async (userId: string, watchId: string, nextCursor: string, date: Date): Promise<void> => {
  const collection = firestore.collection('users').doc(userId);
  const ended = nextCursor === '0';

  await collection.set(
    {
      nextCursor: ended ? '-1' : nextCursor,
      currentWatchesId: ended ? '' : watchId,
      pausedGetFollower: !ended,
      lastUpdated: date,
      newUser: false,
    },
    { merge: true }
  );

  return;
};

export const setUserResultWithNoChange = async (userId: string, date: Date): Promise<void> => {
  const collection = firestore.collection('users').doc(userId);

  await collection.set(
    {
      lastUpdated: date,
      newUser: false,
    },
    { merge: true }
  );

  return;
};

export const updateUserLastUpdatedTwUsers = async (userId: string, date: Date): Promise<void> => {
  const collection = firestore.collection('users').doc(userId);

  await collection.set(
    {
      lastUpdatedTwUsers: date,
    },
    { merge: true }
  );

  return;
};

export const existsRecords = async (userId: string): Promise<boolean> => {
  const snapshot = await firestore
    .collection('users')
    .doc(userId)
    .collection('records')
    .limit(1)
    .get();
  return !snapshot.empty;
};

export const setRecord = async (userId: string, data: UserRecordData): Promise<void> => {
  await firestore
    .collection('users')
    .doc(userId)
    .collection('records')
    .add(data);
  return;
};

const setTwUsersSingle = async (users: TwitterUserInterface[]): Promise<void> => {
  const batch = firestore.batch();
  const collection = firestore.collection('twUsers');

  users.forEach(({ id_str, screen_name, name, profile_image_url_https }) => {
    const ref = collection.doc(id_str);
    const data: TwUserData = {
      id: id_str,
      screenName: screen_name,
      name,
      photoUrl: profile_image_url_https,
    };
    batch.set(ref, data, { merge: true });
  });

  await batch.commit();
  return;
};

export const setTwUsers = async (users: TwitterUserInterface[]): Promise<void> => {
  const requests = _.chunk(users, 500).map((users) => setTwUsersSingle(users));
  await Promise.all(requests);
  return;
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
