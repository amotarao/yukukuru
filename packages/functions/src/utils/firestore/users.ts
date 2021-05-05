import { FirestoreDateLike, UserData } from '@yukukuru/types';
import { firestore, admin } from '../../modules/firebase';
import { getGroupIndex } from '../group';

const collection = firestore.collection('users');

/**
 * ユーザーを初期化
 */
export async function initializeUser(id: string, props: Pick<UserData, 'photoUrl' | 'displayName'>): Promise<void> {
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
    ...props,
  };
  await collection.doc(id).set(data, { merge: true });
}

/**
 * ユーザーの active を true にする
 */
export async function setUserToActive(id: string): Promise<void> {
  const data: Pick<UserData, 'active'> = { active: true };
  await collection.doc(id).update(data);
}

/**
 * ユーザーの active を false にする
 */
export async function setUserToNotActive(id: string): Promise<void> {
  const data: Pick<UserData, 'active'> = { active: false };
  await collection.doc(id).update(data);
}

/**
 * ユーザードキュメントが存在するかどうかを確認
 *
 * @param id ユーザーID
 * @returns 存在するかどうか
 */
export const existsUserDoc = async (id: string): Promise<boolean> => {
  const snapshot = await collection.doc(id).get();
  return snapshot.exists;
};
