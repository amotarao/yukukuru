import { UpdateTwUsersMessage } from '@yukukuru/types';
import { firestore } from '../../modules/firebase';
import { getGroupFromTime } from '../../modules/group';
import { publishUpdateTwUsers } from '../../modules/pubsub/publish/updateTwUsers';
import { PubSubOnRunHandler } from '../../types/functions';
import { log } from '../../utils/log';

export const updateTwUsersHandler: PubSubOnRunHandler = async (context) => {
  const now = new Date(context.timestamp || new Date().getTime());
  const group = getGroupFromTime(1, now);

  // 7日前 (-1h)
  const previous = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 60 * 1000);

  const usersSnap = await firestore
    .collection('users')
    .where('active', '==', true)
    .where('lastUpdatedTwUsers', '<', previous)
    .where('group', '==', group)
    .orderBy('lastUpdatedTwUsers', 'asc')
    .limit(5)
    .get();

  const ids: string[] = usersSnap.docs.map((doc) => doc.id);
  log('updateTwUsers', '', { ids, count: ids.length });

  const items: UpdateTwUsersMessage['data'][] = ids.map((id) => ({ uid: id }));
  await publishUpdateTwUsers(items);
};
