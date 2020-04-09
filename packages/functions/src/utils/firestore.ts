import { RecordDataOld } from '@yukukuru/types';
import { firestore } from '../modules/firebase';
import { TwitterClientErrorData } from '../utils/error';

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

export const setWatch = async (userId: string, followers: string[], date: Date, ended: boolean): Promise<string> => {
  const collection = firestore.collection('users').doc(userId).collection('watches');

  const { id } = await collection.add({
    followers,
    getStartDate: date,
    getEndDate: date,
    ended,
  });
  return id;
};

export const existsRecords = async (userId: string): Promise<boolean> => {
  const snapshot = await firestore.collection('users').doc(userId).collection('records').limit(1).get();
  return !snapshot.empty;
};

export const setRecord = async (userId: string, data: RecordDataOld): Promise<void> => {
  await firestore.collection('users').doc(userId).collection('records').add(data);
  return;
};
