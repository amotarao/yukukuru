import type firebase from 'firebase';
import { firestore } from '../firebase';

const usersCollection = firestore.collection('users');

/**
 * Firestore から Records を取得
 *
 * @param uid 取得対象ユーザーのUID
 * @param startAfter cursor
 */
export const getRecords = async (
  uid: string,
  startAfter: firebase.firestore.QueryDocumentSnapshot | null
): Promise<firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>> => {
  let query = usersCollection.doc(uid).collection('records').orderBy('durationEnd', 'desc');

  if (startAfter) {
    query = query.startAfter(startAfter);
  }

  query = query.limit(50);

  const qs = await query.get();
  return qs;
};
