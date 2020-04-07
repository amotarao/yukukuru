import { FirestoreDateLike, UserData } from '@yukukuru/types';
import { firestore, admin } from '../../modules/firebase';

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

/**
 * ユーザーのactiveをfalseにする
 */
export async function setUserToNotActive(id: string): Promise<void> {
  const data: Pick<UserData, 'active'> = { active: false };
  await collection.doc(id).set(data, { merge: true });
}

/**
 * ユーザーのinvalidを変更
 */
export async function updateUserInvalid(id: string, invalid: boolean): Promise<void> {
  const data: Pick<UserData, 'invalid'> = { invalid };
  await collection.doc(id).set(data, { merge: true });
}
