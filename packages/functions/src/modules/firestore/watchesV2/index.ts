import { FirestoreDateLike, WatchV2 } from '@yukukuru/types';
import { CollectionReference } from 'firebase-admin/firestore';
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
