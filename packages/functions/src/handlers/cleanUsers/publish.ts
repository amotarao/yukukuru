import { UserData } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import { firestore } from '../../modules/firebase';
import { getGroupFromTime } from '../../modules/group';
import { publishMessages } from '../../modules/pubsub/publish';
import { Message, topicName } from './_pubsub';

/**
 * ユーザーデータ削除 定期実行
 *
 * 処理を実行するかどうかは run でチェック
 *
 * 1時間おきに実行
 * グループ毎に 1日おきに実行
 */
export const publish = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('0 0-14 * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = new Date(context.timestamp);

    // 対象ユーザーの取得
    // 実行するかどうかは run で確認
    const group = getGroupFromTime(60, now);

    const snapshot = await firestore
      .collection('users')
      .where('group', '==', group)
      .select('active', 'deletedAuth', 'lastUpdated', 'twitter.followersCount')
      .get();

    // publish データ作成・送信
    const messages: Message[] = snapshot.docs.map((doc) => ({
      uid: doc.id,
      active: doc.get('active') as UserData['active'],
      deletedAuth: doc.get('deletedAuth') as UserData['deletedAuth'],
      lastUpdated: (doc.get('lastUpdated') as UserData['lastUpdated']).toDate(),
      followersCount: doc.get('twitter.followersCount') as UserData['twitter']['followersCount'],
      publishedAt: now,
    }));
    await publishMessages(topicName, messages);

    console.log(`✔️ Completed publish ${messages.length} message.`);
  });
