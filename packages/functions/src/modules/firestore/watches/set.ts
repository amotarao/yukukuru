import { FirestoreDateLike, Watch } from '@yukukuru/types';
import { firestore } from '../../firebase';

const collection = firestore.collection('users');

export const setWatch = async (userId: string, followers: string[], date: Date, ended: boolean): Promise<string> => {
  const watchesCollection = collection.doc(userId).collection('watches');
  const data: Watch<FirestoreDateLike> = {
    followers,
    getStartDate: date,
    getEndDate: date,
    ended,
  };

  const { id } = await watchesCollection.add(data);
  return id;
};
