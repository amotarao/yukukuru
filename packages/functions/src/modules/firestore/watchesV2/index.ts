import { FirestoreDateLike, WatchV2 } from '@yukukuru/types';
import { CollectionReference, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';

const getWatchesV2Collection = (docId: string) =>
  firestore.collection('users').doc(docId).collection('watchesV2') as CollectionReference<WatchV2<FirestoreDateLike>>;

export const setWatchV2 = async (userId: string, followers: string[], date: Date, ended: boolean): Promise<string> => {
  const { id } = await getWatchesV2Collection(userId).add({
    followers,
    date,
    ended,
  });
  return id;
};

export const getLatestEndedWatchesV2Ids = async (userId: string, startAtId: string): Promise<string[]> => {
  const basis = await getWatchesV2Collection(userId).doc(startAtId).get();
  const snapshot = await getWatchesV2Collection(userId)
    .where('ended', '==', true)
    .orderBy('date', 'desc') // 降順であることに注意する
    .startAt(basis)
    .select('date')
    .limit(3)
    .get();
  return snapshot.docs.map((doc) => doc.id);
};

export const getLatestWatchesV2FromId = async (
  userId: string,
  startAfterId?: string
): Promise<QueryDocumentSnapshot<WatchV2>[]> => {
  const basis = startAfterId && (await getWatchesV2Collection(userId).doc(startAfterId).get());
  const snapshot = startAfterId
    ? await getWatchesV2Collection(userId).orderBy('date', 'asc').startAfter(basis).get()
    : await getWatchesV2Collection(userId).orderBy('date', 'asc').get();
  return snapshot.docs as QueryDocumentSnapshot<WatchV2>[];
};
