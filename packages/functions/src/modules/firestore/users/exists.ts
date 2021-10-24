import { firestore } from '../../firebase';

const collection = firestore.collection('users');

/**
 * ユーザードキュメントが存在するかどうかを確認
 *
 * @param id ユーザーID
 * @returns 存在するかどうか
 */
export const existsUserDocument = async (id: string): Promise<boolean> => {
  const snapshot = await collection.doc(id).get();
  return snapshot.exists;
};
