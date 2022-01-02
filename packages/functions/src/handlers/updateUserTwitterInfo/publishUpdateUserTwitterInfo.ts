import { UpdateUserTwitterInfoMessage } from '@yukukuru/types';
import { firestore } from '../../modules/firebase';
import { getGroupFromTime } from '../../modules/group';
import { publishMessages } from '../../modules/pubsub/publish';
import { PubSubOnRunHandler } from '../../types/functions';

export const publishUpdateUserTwitterInfoHandler: PubSubOnRunHandler = async (context) => {
  const now = new Date(context.timestamp);
  const group = getGroupFromTime(1, now);

  // 1日前 (-1m)
  const previous = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 60 * 1000);

  const usersSnap = await firestore
    .collection('users')
    .where('active', '==', true)
    .where('lastUpdatedUserTwitterInfo', '<', previous)
    .where('group', '==', group)
    .orderBy('lastUpdatedUserTwitterInfo', 'asc')
    .limit(10)
    .get();

  const ids: string[] = usersSnap.docs.map((doc) => doc.id);

  const items: UpdateUserTwitterInfoMessage['data'][] = ids.map((id) => ({ uid: id, publishedAt: now }));
  await publishMessages('updateUserTwitterInfo', items);

  console.log(`✔️ Completed publish ${items.length} message.`);
};
