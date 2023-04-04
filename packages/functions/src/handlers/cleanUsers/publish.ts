import * as functions from 'firebase-functions';
import { getUserDocsByGroups } from '../../modules/firestore/users';
import { getGroupFromTime } from '../../modules/group';
import { publishMessages } from '../../modules/pubsub';
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
  .pubsub.schedule('5 0-14 * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = new Date(context.timestamp);

    // 対象ユーザーの取得
    // 実行するかどうかは run で確認
    const group = getGroupFromTime(60, now);

    const docs = await getUserDocsByGroups([group]);

    // publish データ作成・送信
    const messages: Message[] = docs.map((doc) => {
      const { active, deletedAuth, _getFollowersV2Status, twitter } = doc.data();
      return {
        uid: doc.id,
        active: active,
        deletedAuth: deletedAuth,
        lastUpdated: _getFollowersV2Status.lastRun.toDate(),
        followersCount: twitter.followersCount,
        publishedAt: now,
      };
    });
    await publishMessages(topicName, messages);

    console.log(`✔️ Completed publish ${messages.length} message.`);
  });
