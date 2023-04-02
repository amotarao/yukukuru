import { FirestoreDateLike, WatchData } from '@yukukuru/types';
import { CollectionReference, QueryDocumentSnapshot, QuerySnapshot } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';

const usersCollection = firestore.collection('users');

const getWatchesCollection = (uid: string) => {
  return usersCollection.doc(uid).collection('watches') as CollectionReference<WatchData<FirestoreDateLike>>;
};

/**
 * Watches を古い順に取得する
 */
export const getWatches = async (uid: string, limit: number): Promise<QueryDocumentSnapshot<WatchData>[]> => {
  const snapshot = await getWatchesCollection(uid).orderBy('getStartDate').limit(limit).get();
  return snapshot.docs as QueryDocumentSnapshot<WatchData>[];
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
export const getLatestWatches = async (uid: string, limit: number): Promise<QueryDocumentSnapshot<WatchData>[]> => {
  const snapshot = await getWatchesCollection(uid).orderBy('getEndDate', 'desc').limit(limit).get();
  return snapshot.docs as QueryDocumentSnapshot<WatchData>[];
};

/**
 * Watches の件数を取得
 */
export const getWatchesCount = async (uid: string, limit = Infinity): Promise<number> => {
  const querySnapshot = (await getWatchesCollection(uid).select('ended').limit(limit).get()) as QuerySnapshot<
    Pick<WatchData, 'ended'>
  >;
  return querySnapshot.size;
};
