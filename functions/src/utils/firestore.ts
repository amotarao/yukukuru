import { admin, firestore } from '../modules/firebase';
import { TwitterClientErrorData } from '../utils/error';
import { TokenData } from '../utils/interfaces';

export const checkInvalidToken = (errors: TwitterClientErrorData[]): boolean => {
  const error = errors.find(({ code }) => code === 89);
  return error ? true : false;
};

export const checkRateLimitExceeded = (errors: TwitterClientErrorData[]): boolean => {
  const error = errors.find(({ code }) => code === 88);
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

export const setWatch = async (userId: string, followers: string[], date: Date, watchId?: string): Promise<string> => {
  const collection = firestore
    .collection('users')
    .doc(userId)
    .collection('watches');

  if (!watchId) {
    const { id } = await collection.add({
      followers: followers,
      getStartDate: date,
      getEndDate: date,
    });
    return id;
  }

  const ref = await collection.doc(watchId);
  await ref.set(
    {
      followers: admin.firestore.FieldValue.arrayUnion(...followers),
      getEndDate: date,
    },
    { merge: true }
  );
  return ref.id;
};

export const setUserResult = async (userId: string, watchId: string, nextCursor: string, date: Date): Promise<void> => {
  const collection = firestore.collection('users').doc(userId);
  const ended = nextCursor === '0';

  await collection.set(
    {
      nextCursor: ended ? '-1' : nextCursor,
      currentWatchesId: ended ? '' : watchId,
      lastUpdated: date,
      newUser: false,
    },
    { merge: true }
  );

  return;
};
