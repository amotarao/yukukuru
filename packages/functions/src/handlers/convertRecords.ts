import { QueueTypeConvertRecordsData } from '@yukukuru/types';
import { firestore } from '../modules/firebase';
import { addQueuesTypeConvertRecords } from '../utils/firestore/queues/addQueuesTypeConvertRecords';
import { getGroupFromTime } from '../utils/group';
import { PubSubOnRunHandler } from '../types/functions';
import { log } from '../utils/log';

export const convertRecordsHandler: PubSubOnRunHandler = async () => {
  const now = new Date(Math.floor(new Date().getTime() / (60 * 1000)) * 60 * 1000);
  const group = getGroupFromTime(1, now);

  const usersSnap = await firestore.collection('users').where('active', '==', true).where('group', '==', group).get();

  const ids: string[] = usersSnap.docs.map((doc) => doc.id);
  log('convertRecords', '', { ids, count: ids.length });

  const items: QueueTypeConvertRecordsData['data'][] = ids.map((id) => ({ uid: id }));
  await addQueuesTypeConvertRecords(items);
};
