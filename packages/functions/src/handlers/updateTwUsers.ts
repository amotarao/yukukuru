import { QueueTypeUpdateTwUsersData } from '@yukukuru/types';
import { firestore } from '../modules/firebase';
import { publishUpdateTwUsers } from '../modules/pubsub/publish/updateTwUsers';
import { getGroupFromTime } from '../utils/group';
import { PubSubOnRunHandler } from '../types/functions';
import { log } from '../utils/log';

export const updateTwUsersHandler: PubSubOnRunHandler = async () => {
  const now = new Date(Math.floor(new Date().getTime() / (60 * 1000)) * 60 * 1000);
  const group = getGroupFromTime(12, now);

  // 3日前
  const previous = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 60 * 1000);

  const usersSnap = await firestore
    .collection('users')
    .where('active', '==', true)
    .where('lastUpdatedTwUsers', '<', previous)
    .where('group', '==', group)
    .get();

  const ids: string[] = usersSnap.docs.map((doc) => doc.id);
  log('updateTwUsers', '', { ids, count: ids.length });

  const items: QueueTypeUpdateTwUsersData['data'][] = ids.map((id) => ({ uid: id }));
  await publishUpdateTwUsers(items);
};
