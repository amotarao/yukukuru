import { FirestoreIdData, UserData, QueueTypeConvertRecordsData } from '@yukukuru/types';
import { firestore } from '../modules/firebase';
import { addQueuesTypeConvertRecords } from '../utils/firestore/queues/addQueuesTypeConvertRecords';
import { getGroupFromTime } from '../utils/group';
import { PubSubOnRunHandler } from '../types/functions';

export const convertRecordsHandler: PubSubOnRunHandler = async () => {
  const now = new Date(Math.floor(new Date().getTime() / (60 * 1000)) * 60 * 1000);
  const group = getGroupFromTime(1, now);

  const usersSnap = await firestore.collection('users').where('active', '==', true).where('group', '==', group).get();

  const docs: FirestoreIdData<UserData>[] = usersSnap.docs.map((doc) => {
    return {
      id: doc.id,
      data: doc.data() as UserData,
    };
  });
  console.log({ ids: docs.map((doc) => doc.id).join(','), count: docs.length });

  const items: QueueTypeConvertRecordsData['data'][] = docs.map((doc) => ({
    uid: doc.id,
  }));
  await addQueuesTypeConvertRecords(items);
};
