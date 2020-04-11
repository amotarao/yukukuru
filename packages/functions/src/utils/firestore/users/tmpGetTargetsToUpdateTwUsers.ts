import { UserData, FirestoreIdData } from '@yukukuru/types';
import { firestore } from '../../../modules/firebase';

export const tmpGetTargetsToUpdateTwUsers = async (): Promise<FirestoreIdData<UserData>[]> => {
  const now = new Date();
  const time1week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const qs = await firestore
    .collection('users')
    .where('active', '==', true)
    .where('invalid', '==', false)
    .where('newUser', '==', false)
    .where('lastUpdatedTwUsers', '<', time1week)
    .orderBy('lastUpdatedTwUsers')
    .limit(50)
    .get();

  return qs.docs.map((doc) => ({
    id: doc.id,
    data: doc.data() as UserData,
  }));
};
