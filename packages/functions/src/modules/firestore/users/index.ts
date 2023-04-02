import { UserData } from '@yukukuru/types';
import { FieldValue } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';

const collection = firestore.collection('users');

/** グループを指定してユーザーリストを取得 */
export const getUsersByGroup = async (group: number): Promise<{ id: string; data: UserData }[]> => {
  const snapshot = await collection.where('group', '==', group).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() as UserData }));
};

/** role を更新 */
export const setRoleToUser = async (id: string, role: UserData['role']): Promise<void> => {
  const ref = collection.doc(id);
  const data: Pick<UserData, 'role'> = { role };
  await ref.update(data);
};

/** 対象のユーザーが allowedAccessUsers に含まれるユーザーリストを取得 */
export const getUsersInAllowedAccessUsers = async (id: string): Promise<{ id: string; data: UserData }[]> => {
  const snapshot = await collection.where('allowedAccessUsers', 'array-contains', id).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() as UserData }));
};

/** 対象ユーザーを allowedAccessUsers から削除 */
export const removeIdFromAllowedAccessUsers = async (id: string, targetId: string): Promise<void> => {
  const ref = collection.doc(id);
  // FieldValue を用いるため、型定義が難しい
  const data = {
    allowedAccessUsers: FieldValue.arrayRemove(targetId),
  };
  await ref.update(data);
};
