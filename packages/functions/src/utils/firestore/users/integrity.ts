import { FirestoreDateLike, UserData } from '@yukukuru/types';
import { firestore } from '../../../modules/firebase';

const usersCollection = firestore.collection('users');

export const updateUserCheckIntegrity = async (uid: string, date: Date): Promise<void> => {
  const doc = usersCollection.doc(uid);
  const data: Pick<UserData<FirestoreDateLike>, 'lastUpdatedCheckIntegrity'> = {
    lastUpdatedCheckIntegrity: date,
  };
  await doc.update(data);
};
