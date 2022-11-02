import { UserData } from '@yukukuru/types';
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
 * グループ毎に 15分おきに実行
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
    const now = new Date(context.timestamp);

    // 対象ユーザーの取得
    // 実行するかどうかは run で確認
    const group = getGroupFromTime(1, now);
    const snapshot = await firestore
      .collection('users')
      .where('active', '==', true)
      .where('group', '==', group)
      .select('twitter.id', 'nextCursor', 'lastUpdated')
      .get();

    // publish データ作成・送信
    const messages: Message[] = snapshot.docs.map((doc) => ({
      uid: doc.id,
      twitterId: doc.get('twitter.id') as UserData['twitter']['id'],
      nextCursor: doc.get('nextCursor') as UserData['nextCursor'],
      lastRun: (doc.get('lastUpdated') as UserData['lastUpdated']).toDate(),
      publishedAt: now,
    }));
    await publishMessages(topicName, messages);

    console.log(`✔️ Completed publish ${messages.length} message.`);
  });
