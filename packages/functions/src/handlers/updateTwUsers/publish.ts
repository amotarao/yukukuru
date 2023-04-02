import { UserData } from '@yukukuru/types';
import * as dayjs from 'dayjs';
import { QuerySnapshot } from 'firebase-admin/firestore';
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

    const snapshot = (await firestore
      .collection('users')
      .where('active', '==', true)
      .where('lastUpdatedTwUsers', '<', previous)
      .where('group', '==', group)
      .orderBy('lastUpdatedTwUsers', 'asc')
      .get()) as QuerySnapshot<UserData>;

    const messages: Message[] = snapshot.docs
      .filter((doc) => !doc.data().deletedAuth)
      .map((doc) => doc.id)
      .map((id) => ({ uid: id, publishedAt: now }))
      .slice(0, 5);
    await publishMessages(topicName, messages);

    console.log(`✔️ Completed publish ${messages.length} message.`);
  });
