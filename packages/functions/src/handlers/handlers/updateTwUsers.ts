import { UpdateTwUsersMessage } from '@yukukuru/types';
import { firestore } from '../../modules/firebase';
import { publishUpdateTwUsers } from '../../modules/pubsub/publish/updateTwUsers';
import { PubSubOnRunHandler } from '../../types/functions';
import { getGroupFromTime } from '../../utils/group';
import { log } from '../../utils/log';

export const updateTwUsersHandler: PubSubOnRunHandler = async () => {
  const now = new Date(Math.floor(new Date().getTime() / (60 * 1000)) * 60 * 1000);
  const group = getGroupFromTime(1, now);

  // 3日前
  const previous = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 60 * 1000);

  const usersSnap = await firestore
    .collection('users')
    .where('active', '==', true)
    .where('lastUpdatedTwUsers', '<', previous)
    .where('group', '==', group)
    .limit(5)
    .get();

  const ids: string[] = usersSnap.docs.map((doc) => doc.id);
  log('updateTwUsers', '', { ids, count: ids.length });

  const items: UpdateTwUsersMessage['data'][] = ids.map((id) => ({ uid: id }));
  await publishUpdateTwUsers(items);
};
