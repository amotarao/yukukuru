import { FirestoreDateLike, User } from '@yukukuru/types';
import { CollectionReference, FieldValue, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';

export const usersCollectionRef = firestore.collection('users') as CollectionReference<User<FirestoreDateLike>>;

/** グループを指定してユーザーリストを取得 */
export const getUserDocsByGroups = async (groups: number[]): Promise<QueryDocumentSnapshot<User>[]> => {
  const snapshot = await usersCollectionRef.where('group', 'in', groups).get();
  return snapshot.docs as QueryDocumentSnapshot<User>[];
};

/** role を更新 */
export const setRoleToUser = async (id: string, role: User['role']): Promise<void> => {
  const ref = usersCollectionRef.doc(id);
  const data: Pick<User, 'role'> = { role };
  await ref.update(data);
};

/** 対象のユーザーが linkedUserIds に含まれるユーザーリストを取得 */
export const getUserDocsInLinkedUserIds = async (id: string): Promise<QueryDocumentSnapshot<User>[]> => {
  const snapshot = await usersCollectionRef.where('linkedUserIds', 'array-contains', id).get();
  return snapshot.docs as QueryDocumentSnapshot<User>[];
};

/** 対象ユーザーを linkedUserIds から削除 */
export const removeIdFromLinkedUserIds = async (id: string, targetId: string): Promise<void> => {
  const ref = usersCollectionRef.doc(id);
  // FieldValue を用いるため、型定義が難しい
  const data = {
    linkedUserIds: FieldValue.arrayRemove(targetId),
  };
  await ref.update(data);
};

/** ユーザーを取得 */
export const getUser = async (id: string): Promise<User> => {
  const doc = await usersCollectionRef.doc(id).get();
  if (!doc.exists) {
    throw new Error('❌ Not found user.');
  }
  return doc.data() as User;
};

export const deleteUser = async (id: string): Promise<void> => {
  await usersCollectionRef.doc(id).delete();
};

export const updateTwiterStatusOfUser = async (id: string, status: User<Date>['_twitterStatus']): Promise<void> => {
  await usersCollectionRef.doc(id).update(
    {
      _twitterStatus: status,
    },
    { exists: true }
  );
};

export const updateTokenStatusOfUser = async (id: string, status: User<Date>['_tokenStatus']): Promise<void> => {
  await usersCollectionRef.doc(id).update(
    {
      _tokenStatus: status,
    },
    { exists: true }
  );
};
