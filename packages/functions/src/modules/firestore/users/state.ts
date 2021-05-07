import { FirestoreDateLike, UserData } from '@yukukuru/types';
import { firestore } from '../../firebase';

const usersCollection = firestore.collection('users');

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

export const updateUserCheckIntegrity = async (uid: string, date: Date): Promise<void> => {
  const doc = usersCollection.doc(uid);
  const data: Pick<UserData<FirestoreDateLike>, 'lastUpdatedCheckIntegrity'> = {
    lastUpdatedCheckIntegrity: date,
  };
  await doc.update(data);
};
