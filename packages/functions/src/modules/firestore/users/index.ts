import { FirestoreDateLike, User } from '@yukukuru/types';
import { CollectionReference, FieldValue, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';

export const usersCollection = firestore.collection('users') as CollectionReference<User<FirestoreDateLike>>;

/** グループを指定してユーザーリストを取得 */
export const getUserDocsByGroups = async (groups: number[]): Promise<QueryDocumentSnapshot<User>[]> => {
  const snapshot = await usersCollection.where('group', 'in', groups).get();
  return snapshot.docs as QueryDocumentSnapshot<User>[];
};

/** role を更新 */
export const setRoleToUser = async (id: string, role: User['role']): Promise<void> => {
  const ref = usersCollection.doc(id);
  const data: Pick<User, 'role'> = { role };
  await ref.update(data);
};

/** 対象のユーザーが allowedAccessUsers に含まれるユーザーリストを取得 */
export const getUsersInAllowedAccessUsers = async (id: string): Promise<{ id: string; data: User }[]> => {
  const snapshot = await usersCollection.where('allowedAccessUsers', 'array-contains', id).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() as User }));
};

/** 対象ユーザーを allowedAccessUsers から削除 */
export const removeIdFromAllowedAccessUsers = async (id: string, targetId: string): Promise<void> => {
  const ref = usersCollection.doc(id);
  // FieldValue を用いるため、型定義が難しい
  const data = {
    allowedAccessUsers: FieldValue.arrayRemove(targetId),
  };
  await ref.update(data);
};

/** ユーザーを取得 */
export const getUser = async (id: string): Promise<User> => {
  const doc = await usersCollection.doc(id).get();
  return doc.data() as User;
};
