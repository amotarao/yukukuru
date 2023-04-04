import { FirestoreDateLike, Watch } from '@yukukuru/types';
import { CollectionReference, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';

const usersCollection = firestore.collection('users');

const getWatchesCollection = (uid: string) => {
  return usersCollection.doc(uid).collection('watches') as CollectionReference<Watch<FirestoreDateLike>>;
};

/**
 * Watches を古い順に取得する
 */
export const getWatches = async (uid: string, limit: number): Promise<QueryDocumentSnapshot<Watch>[]> => {
  const snapshot = await getWatchesCollection(uid).orderBy('getStartDate').limit(limit).get();
  return snapshot.docs as QueryDocumentSnapshot<Watch>[];
};

/**
 * Watches の ID のみを古い順に取得する
 */
export const getWatchesIds = async (uid: string, limit: number): Promise<string[]> => {
  const docs = await getWatches(uid, limit);
  return docs.map((doc) => doc.id);
};

/**
 * Watches を新しい順に順に取得する
 */
export const getLatestWatches = async (uid: string, limit: number): Promise<QueryDocumentSnapshot<Watch>[]> => {
  const snapshot = await getWatchesCollection(uid).orderBy('getEndDate', 'desc').limit(limit).get();
  return snapshot.docs as QueryDocumentSnapshot<Watch>[];
};

export const getWatchesCount = async (uid: string): Promise<number> => {
  const snapshot = await getWatchesCollection(uid).count().get();
  return snapshot.data().count;
};

export const deleteWatches = async (uid: string, deleteIds: string[]): Promise<void> => {
  const bulkWriter = firestore.bulkWriter();
  deleteIds.forEach((deleteId) => {
    bulkWriter.delete(getWatchesCollection(uid).doc(deleteId));
  });
  await bulkWriter.close();
};
