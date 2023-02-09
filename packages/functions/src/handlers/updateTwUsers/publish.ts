import { UserData } from '@yukukuru/types';
import * as dayjs from 'dayjs';
import * as functions from 'firebase-functions';
import { firestore } from '../../modules/firebase';
import { getGroupFromTime } from '../../modules/group';
import { publishMessages } from '../../modules/pubsub/publish';
import { Message, topicName } from './_pubsub';

/** Twitter ユーザー情報更新 定期実行 */
export const publish = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = new Date(context.timestamp);
    const group = getGroupFromTime(1, now);

    // 7日前
    const previous = dayjs(now).subtract(7, 'days').subtract(1, 'minutes').toDate();

    const usersSnap = await firestore
      .collection('users')
      .where('active', '==', true)
      .where('lastUpdatedTwUsers', '<', previous)
      .where('group', '==', group)
      .orderBy('lastUpdatedTwUsers', 'asc')
      .get();

    const items: Message[] = usersSnap.docs
      .filter((doc) => !(doc.get('deletedAuth') as UserData['deletedAuth']))
      .map((doc) => doc.id)
      .map((id) => ({ uid: id, publishedAt: now }))
      .slice(0, 5);
    await publishMessages(topicName, items);

    console.log(`✔️ Completed publish ${items.length} message.`);
  });
