import { FirestoreDateLike, Timestamp, UserStatus } from '@yukukuru/types';
import { CollectionReference } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';

const collection = firestore.collection('userStatuses') as CollectionReference<UserStatus<FirestoreDateLike>>;

export const getUserLastViewing = async (uid: string): Promise<Date | null> => {
  const snapshot = await collection.doc(uid).get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data() as UserStatus<Timestamp>;
  return data.lastViewing.toDate();
};
