import { FirestoreIdData, WatchData } from '@yukukuru/types';
import { QuerySnapshot } from 'firebase-admin/firestore';
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
 * Watches の ID のみを古い順に取得する
 */
export const getWatchesIds = async ({ uid, count }: Props): Promise<string[]> => {
  const request = usersCollection
    .doc(uid)
    .collection('watches')
    .orderBy('getStartDate')
    .select('ended')
    .limit(count)
    .get() as Promise<QuerySnapshot<Pick<WatchData, 'ended'>>>;

  const qs = await request.catch((): false => false);
  if (!qs) {
    return [];
  }

  const ids = qs.docs.map((doc) => doc.id);
  return ids;
};

/**
 * Watches を新しい順に順に取得する
 */
export const getLatestWatches = async ({ uid, count }: Props): Promise<Response> => {
  const request = usersCollection
    .doc(uid)
    .collection('watches')
    .orderBy('getEndDate', 'desc')
    .limit(count)
    .get() as Promise<QuerySnapshot<WatchData>>;

  const qs = await request.catch((): false => false);
  if (!qs) {
    return [];
  }

  const docs = qs.docs.map((doc) => {
    return {
      id: doc.id,
      data: doc.data(),
    };
  });

  return docs;
};

/**
 * Watches の件数を取得
 */
export const getWatchesCount = async (uid: string, limit = Infinity): Promise<number> => {
  const querySnapshot = (await usersCollection
    .doc(uid)
    .collection('watches')
    .select('ended')
    .limit(limit)
    .get()) as QuerySnapshot<Pick<WatchData, 'ended'>>;
  return querySnapshot.size;
};
