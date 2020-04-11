import { WatchData } from '@yukukuru/types';
import { firestore } from '../../../../modules/firebase';

export const getLastWatch = async (id: string): Promise<WatchData | null> => {
  const qs = await firestore
    .collection('users')
    .doc(id)
    .collection('watches')
    .orderBy('getEndDate', 'desc')
    .limit(1)
    .get();
  if (qs.docs.length < 1) {
    return null;
  }
  const doc = qs.docs[0];
  return doc.data() as WatchData;
};
