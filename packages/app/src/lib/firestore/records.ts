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
  where,
} from 'firebase/firestore';
import { firestore } from '../firebase';

/**
 * Firestore から Records を取得
 *
 * @param uid 取得対象ユーザーのUID
 * @param startAfter cursor
 */
export const fetchRecords = async (
  uid: string,
  limitCount: number,
  startAfterDoc: QueryDocumentSnapshot | Date | null
): Promise<QuerySnapshot<Record>> => {
  const ref = collection(firestore, 'users', uid, 'records') as CollectionReference<Record>;
  let q = query(ref, orderBy('durationEnd', 'desc'));
  if (startAfterDoc) {
    q = query(q, startAfter(startAfterDoc));
  }
  q = query(q, limit(limitCount));

  const qs = await getDocs(q);
  return qs;
};

/**
 * Firestore から RecordsV2 を取得
 *
 * @param uid 取得対象ユーザーのUID
 * @param startAfter cursor
 */
export const fetchRecordsV2 = async (
  uid: string,
  limitCount: number,
  startAfterDoc: QueryDocumentSnapshot | null
): Promise<QuerySnapshot<RecordV2>> => {
  const ref = collection(firestore, 'users', uid, 'recordsV2') as CollectionReference<RecordV2>;
  let q = query(ref, where('_deleted', '==', false));
  q = query(q, orderBy('date', 'desc'));
  if (startAfterDoc) {
    q = query(q, startAfter(startAfterDoc));
  }
  q = query(q, limit(limitCount));

  const qs = await getDocs(q);
  return qs;
};
