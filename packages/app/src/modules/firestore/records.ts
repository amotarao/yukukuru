import {
  collection,
  DocumentData,
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
): Promise<QuerySnapshot<DocumentData>> => {
  const ref = collection(firestore, 'users', uid, 'records');
  console.log(ref.path);
  let q = query(ref, orderBy('durationEnd', 'desc'));
  if (startAfterDoc) {
    q = query(q, startAfter(startAfterDoc));
  }
  q = query(q, limit(50));

  const qs = await getDocs(q);
  return qs;
};
