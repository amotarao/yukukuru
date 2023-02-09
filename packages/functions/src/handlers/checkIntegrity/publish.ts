import { UserData } from '@yukukuru/types';
import * as dayjs from 'dayjs';
import * as functions from 'firebase-functions';
import { firestore } from '../../modules/firebase';
import { getGroupFromTime } from '../../modules/group';
import { publishMessages } from '../../modules/pubsub/publish';
import { Message, topicName } from './_pubsub';

/**
 * 整合性チェック 定期実行
 * 整合性チェックのキューを作成
 *
 * 12分ごとに 1グループずつ実行
 * 1日に 120回実行
 * ユーザーごとに 3時間ごとに実行
 */
export const publish = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('*/12 * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = new Date(context.timestamp);
    const group = getGroupFromTime(12, now);

    // 3時間前
    const previous = dayjs(now).subtract(3, 'hours').subtract(1, 'minutes').toDate();

    const snapshot = await firestore
      .collection('users')
      .where('active', '==', true)
      .where('lastUpdatedCheckIntegrity', '<', previous)
      .where('group', '==', group)
      .get();

    const items: Message[] = snapshot.docs
      .filter((doc) => !(doc.get('deletedAuth') as UserData['deletedAuth']))
      .map((doc) => doc.id)
      .map((id) => ({ uid: id, publishedAt: now }));
    await publishMessages(topicName, items);

    console.log(`✔️ Completed publish ${items.length} message.`);
  });
