import { User } from '@yukukuru/types';
import { usersCollection } from '.';

/**
 * ユーザーの deletedAuth を true にする
 * auth が削除された場合に実行
 */
export async function setUserDeletedAuth(id: string): Promise<void> {
  const data: Pick<User, 'deletedAuth'> = { deletedAuth: true };
  await usersCollection.doc(id).update(data);
}
