import { UserData } from '@yukukuru/types';
import { firestore } from '../../firebase';

const collection = firestore.collection('users');

/**
 * ユーザーの deletedAuth を true にする
 * auth が削除された場合に実行
 */
export async function setUserDeletedAuth(id: string): Promise<void> {
  const data: Pick<UserData, 'deletedAuth'> = { deletedAuth: true };
  await collection.doc(id).update(data);
}
