import { DeletedUser, FirestoreDateLike } from '@yukukuru/types';
import { CollectionReference } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';

export const deletedUsersCollection = firestore.collection('deletedUsers') as CollectionReference<
  DeletedUser<FirestoreDateLike>
>;

export const setDeletedUser = async (id: string, deletedUser: DeletedUser<FirestoreDateLike>) => {
  await deletedUsersCollection.doc(id).set(deletedUser, { merge: true });
};
