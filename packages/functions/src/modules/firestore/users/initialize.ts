import { FirestoreDateLike, UserData } from '@yukukuru/types';
import { firestore, admin } from '../../firebase';
import { getGroupIndex } from '../../group';

const collection = firestore.collection('users');

/**
 * ユーザーを初期化
 */
export const initializeUser = async (id: string): Promise<void> => {
  const now = admin.firestore.FieldValue.serverTimestamp();

  const data: UserData<FirestoreDateLike> = {
    active: true,
    lastUpdated: now,
    lastUpdatedTwUsers: now,
    lastUpdatedCheckIntegrity: now,
    nextCursor: '-1',
    currentWatchesId: '',
    pausedGetFollower: false,
    group: getGroupIndex(id),
  };
  await collection.doc(id).set(data, { merge: true });
};
