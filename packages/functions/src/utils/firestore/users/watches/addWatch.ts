import { FirestoreDateLike, WatchData } from '@yukukuru/types';
import { firestore } from '../../../../modules/firebase';

export const addWatch = async (userId: string, followers: string[], date: Date, ended: boolean): Promise<string> => {
  const data: WatchData<FirestoreDateLike> = {
    followers,
    getStartDate: date,
    getEndDate: date,
    ended,
  };

  const { id } = await firestore.collection('users').doc(userId).collection('watches').add(data);
  return id;
};
