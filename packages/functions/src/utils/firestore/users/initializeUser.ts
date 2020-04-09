import { FirestoreDateLike, UserData } from '@yukukuru/types';
import { firestore, admin } from '../../../modules/firebase';

const collection = firestore.collection('users');

/**
 * ユーザーを初期化
 */
export async function initializeUser(id: string, props: Pick<UserData, 'photoUrl' | 'displayName'>): Promise<void> {
  const now = admin.firestore.FieldValue.serverTimestamp();

  const data: UserData<FirestoreDateLike> = {
    active: true,
    invalid: false,
    newUser: true,
    lastUpdated: admin.firestore.Timestamp.now(),
    lastUpdatedTwUsers: now,
    nextCursor: '-1',
    currentWatchesId: '',
    pausedGetFollower: false,
    ...props,
  };
  await collection.doc(id).set(data, { merge: true });
}
