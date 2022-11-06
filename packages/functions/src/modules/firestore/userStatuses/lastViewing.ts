import { UserStatusData } from '@yukukuru/types';
import { firestore } from '../../firebase';

const collection = firestore.collection('userStatuses');

export const getUserLastViewing = async (uid: string): Promise<Date | null> => {
  const snapshot = await collection.doc(uid).get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data() as UserStatusData;
  return data.lastViewing.toDate();
};
