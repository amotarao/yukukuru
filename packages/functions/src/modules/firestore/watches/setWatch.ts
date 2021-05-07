import { FirestoreDateLike, WatchData } from '@yukukuru/types';
import { firestore } from '../../firebase';

export const setWatch = async (userId: string, followers: string[], date: Date, ended: boolean): Promise<string> => {
  const collection = firestore.collection('users').doc(userId).collection('watches');
  const data: WatchData<FirestoreDateLike> = {
    followers,
    getStartDate: date,
    getEndDate: date,
    ended,
  };

  const { id } = await collection.add(data);
  return id;
};
