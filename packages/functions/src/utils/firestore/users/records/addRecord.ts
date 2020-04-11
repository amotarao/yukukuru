import { RecordDataOld } from '@yukukuru/types';
import { firestore } from '../../../../modules/firebase';

export const addRecord = async (userId: string, data: RecordDataOld): Promise<string> => {
  const { id } = await firestore.collection('users').doc(userId).collection('records').add(data);
  return id;
};
