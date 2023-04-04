import { Record, RecordV2 } from '@yukukuru/types';
import {
  collection,
  CollectionReference,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  startAfter,
} from 'firebase/firestore';
import { firestore } from '../firebase';

/**
 * Firestore から Records を取得
 *
 * @param uid 取得対象ユーザーのUID
 * @param startAfter cursor
 */
export const getRecords = async (
  uid: string,
  startAfterDoc: QueryDocumentSnapshot | null
): Promise<QuerySnapshot<Record>> => {
  const ref = collection(firestore, 'users', uid, 'records') as CollectionReference<Record>;
  let q = query(ref, orderBy('durationEnd', 'desc'));
  if (startAfterDoc) {
    q = query(q, startAfter(startAfterDoc));
  }
  q = query(q, limit(50));

  const qs = await getDocs(q);
  return qs;
};

/**
 * Firestore から RecordsV2 を取得
 *
 * @param uid 取得対象ユーザーのUID
 * @param startAfter cursor
 */
export const getRecordsV2 = async (
  uid: string,
  startAfterDoc: QueryDocumentSnapshot | null
): Promise<QuerySnapshot<RecordV2>> => {
  const ref = collection(firestore, 'users', uid, 'recordsV2') as CollectionReference<RecordV2>;
  let q = query(ref, orderBy('durationEnd', 'desc'));
  if (startAfterDoc) {
    q = query(q, startAfter(startAfterDoc));
  }
  q = query(q, limit(50));

  const qs = await getDocs(q);
  return qs;
};
