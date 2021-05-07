import { UserData } from '@yukukuru/types';
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
