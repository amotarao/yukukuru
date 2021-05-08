import { FirestoreIdData, WatchData } from '@yukukuru/types';
import { firestore } from '../../firebase';

const usersCollection = firestore.collection('users');

type Props = {
  uid: string;
  count: number;
};

type Response = FirestoreIdData<WatchData>[];

/**
 * Watches を古い順に取得する
 */
export const getWatches = async ({ uid, count }: Props): Promise<Response> => {
  const request = usersCollection.doc(uid).collection('watches').orderBy('getStartDate').limit(count).get();

  const qs = await request.catch((): false => false);
  if (!qs) {
    return [];
  }

  const docs = qs.docs.map((doc) => {
    return {
      id: doc.id,
      data: doc.data() as WatchData,
    };
  });

  return docs;
};

/**
 * Watches を新しい順に順に取得する
 */
export const getLatestWatches = async ({ uid, count }: Props): Promise<Response> => {
  const request = usersCollection.doc(uid).collection('watches').orderBy('getEndDate', 'desc').limit(count).get();

  const qs = await request.catch((): false => false);
  if (!qs) {
    return [];
  }

  const docs = qs.docs.map((doc) => {
    return {
      id: doc.id,
      data: doc.data() as WatchData,
    };
  });

  return docs;
};
