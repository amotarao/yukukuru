import { FirestoreDateLike, UserData } from '@yukukuru/types';
import { firestore } from '../../../modules/firebase';

const collection = firestore.collection('users');

export const setUserResultWithNoChange = async (userId: string, date: Date): Promise<void> => {
  const data: Pick<UserData<FirestoreDateLike>, 'lastUpdated' | 'newUser'> = {
    lastUpdated: date,
    newUser: false,
  };

  await collection.doc(userId).set(data, { merge: true });
};
