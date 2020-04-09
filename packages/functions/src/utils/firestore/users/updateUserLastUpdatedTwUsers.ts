import { FirestoreDateLike, UserData } from '@yukukuru/types';
import { firestore } from '../../../modules/firebase';

const collection = firestore.collection('users');

export const updateUserLastUpdatedTwUsers = async (userId: string, date: Date): Promise<void> => {
  const data: Pick<UserData<FirestoreDateLike>, 'lastUpdatedTwUsers'> = {
    lastUpdatedTwUsers: date,
  };

  await collection.doc(userId).set(data, { merge: true });
};
