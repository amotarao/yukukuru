import { firestore } from '../../firebase';

const collection = firestore.collection('users');

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
