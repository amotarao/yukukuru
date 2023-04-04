import { Record } from '@yukukuru/types';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { getRecordsCollection } from '.';

/**
 * Records を古い順に取得する
 */
export const getRecords = async (uid: string, cursor: Date, max?: Date): Promise<QueryDocumentSnapshot<Record>[]> => {
  const collection = getRecordsCollection(uid);
  const request = max
    ? collection.orderBy('durationEnd').startAfter(cursor).endAt(max).get()
    : collection.orderBy('durationEnd').startAfter(cursor).get();

  const qs = await request.catch((): false => false);
  if (!qs) {
    return [];
  }

  return qs.docs as QueryDocumentSnapshot<Record>[];
};

/**
 * 指定したユーザーの records の存在を確認
 *
 * @param uid 指定するユーザー
 */
export const existsRecords = async (uid: string): Promise<boolean> => {
  const snapshot = await getRecordsCollection(uid).limit(1).get();
  return !snapshot.empty;
};
