import { usersCollectionRef } from '.';

/**
 * ユーザードキュメントが存在するかどうかを確認
 *
 * @param id ユーザーID
 * @returns 存在するかどうか
 */
export const existsUser = async (id: string): Promise<boolean> => {
  const snapshot = await usersCollectionRef.doc(id).get();
  return snapshot.exists;
};
