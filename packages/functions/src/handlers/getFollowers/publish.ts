import { UserData } from '@yukukuru/types';
import * as dayjs from 'dayjs';
import * as functions from 'firebase-functions';
import { firestore } from '../../modules/firebase';
import { getGroupFromTime } from '../../modules/group';
import { publishMessages } from '../../modules/pubsub/publish';
import { Message, topicName } from './_pubsub';

/**
 * フォロワー取得 定期実行
 *
 * 処理を実行するかどうかは run でチェック
 *
 * 毎分実行
 * グループ毎に 5分おきに実行
 */
export const publish = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = dayjs(context.timestamp);

    // 対象ユーザーの取得
    // 実行するかどうかは run で確認
    const groups = [
      getGroupFromTime(1, now.toDate()),
      getGroupFromTime(1, now.add(5, 'minutes').toDate()),
      getGroupFromTime(1, now.add(10, 'minutes').toDate()),
    ];
    const snapshot = await firestore
      .collection('users')
      .where('active', '==', true)
      .where('group', 'in', groups)
      .select('deletedAuth', 'twitter.id', 'nextCursor', 'lastUpdated')
      .get();

    // publish データ作成・送信
    const messages: Message[] = snapshot.docs
      .filter((doc) => !(doc.get('deletedAuth') as UserData['deletedAuth']))
      .map((doc) => ({
        uid: doc.id,
        twitterId: doc.get('twitter.id') as UserData['twitter']['id'],
        nextCursor: doc.get('nextCursor') as UserData['nextCursor'],
        lastRun: (doc.get('lastUpdated') as UserData['lastUpdated']).toDate(),
        publishedAt: now.toDate(),
      }));
    await publishMessages(topicName, messages);

    console.log(`✔️ Completed publish ${messages.length} message.`);
  });
