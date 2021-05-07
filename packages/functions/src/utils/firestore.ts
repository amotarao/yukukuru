import { FirestoreDateLike, UserData, WatchData } from '@yukukuru/types';
import { firestore } from '../modules/firebase';

export const bulkWriterErrorHandler = (error: FirebaseFirestore.BulkWriterError): boolean => {
  const MAX_RETRY_ATTEMPTS = 5;

  if (error.code === FirebaseFirestore.GrpcStatus.UNAVAILABLE && error.failedAttempts < MAX_RETRY_ATTEMPTS) {
    return true;
  }
  console.error(`❗️[Error]: Failed to ${error.operationType} document for ${error.documentRef}`);
  return false;
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
