import { UserData } from '@yukukuru/types';
import { firestore } from '../../../modules/firebase';

const collection = firestore.collection('users');

/**
 * ユーザーのactiveをfalseにする
 */
export async function setUserToNotActive(id: string): Promise<void> {
  const data: Pick<UserData, 'active'> = { active: false };
  await collection.doc(id).set(data, { merge: true });
}
