import { UserData } from '@yukukuru/types';
import * as dayjs from 'dayjs';
import { QuerySnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { firestore } from '../../modules/firebase';
import { getGroupFromTime } from '../../modules/group';
import { publishMessages } from '../../modules/pubsub/publish';
import { Message, topicName } from './_pubsub';

/** Twitter 情報更新 定期実行 */
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

    // 3日前
    const previous = dayjs(now).subtract(3, 'days').subtract(1, 'minutes').toDate();

    const usersSnap = (await firestore
      .collection('users')
      .where('active', '==', true)
      .where('lastUpdatedUserTwitterInfo', '<', previous)
      .where('group', '==', group)
      .orderBy('lastUpdatedUserTwitterInfo', 'asc')
      .get()) as QuerySnapshot<UserData>;

    const messages: Message[] = usersSnap.docs
      .filter((doc) => !doc.data().deletedAuth)
      .map(
        (doc): Message => ({
          uid: doc.id,
          twitterId: doc.data().twitter.id,
          publishedAt: now,
        })
      )
      .slice(0, 10);
    await publishMessages(topicName, messages);

    console.log(`✔️ Completed publish ${messages.length} message.`);
  });
