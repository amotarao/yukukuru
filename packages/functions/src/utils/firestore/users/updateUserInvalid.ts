import { UserData } from '@yukukuru/types';
import { firestore } from '../../../modules/firebase';

const collection = firestore.collection('users');

/**
 * ユーザーのinvalidを変更
 */
export async function updateUserInvalid(id: string, invalid: boolean): Promise<void> {
  const data: Pick<UserData, 'invalid'> = { invalid };
  await collection.doc(id).set(data, { merge: true });
}
