import { DeletedUser } from '@yukukuru/types';
import { CollectionReference } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';

export const deletedUsersCollection = firestore.collection('deletedUsers') as CollectionReference<DeletedUser>;

export const setDeletedUser = async (id: string, deletedUser: DeletedUser) => {
  await deletedUsersCollection.doc(id).set(deletedUser);
};
