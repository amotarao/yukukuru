import * as dayjs from 'dayjs';
import * as functions from 'firebase-functions';
import { getStripeRole } from '../../modules/auth/claim';
import { deleteAuth } from '../../modules/auth/delete';
import { getUserLastViewing } from '../../modules/firestore/userStatuses';
import { getUserDocsByGroups } from '../../modules/firestore/users';
import { checkJustPublished } from '../../modules/functions';
import { getGroupFromTime } from '../../modules/group';
import { publishMessages } from '../../modules/pubsub';

const topicName = 'cleanUsers';

type Message = {
  /** Firebase UID */
  uid: string;

  /** フォロワー一覧取得 最終実行日時 */
  lastRun: Date | string;

  /** 送信日時 */
  publishedAt: Date | string;
};

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
      const { _getFollowersV2Status } = doc.data();
      return {
        uid: doc.id,
        lastRun: _getFollowersV2Status.lastRun.toDate(),
        publishedAt: now,
      };
    });
    await publishMessages(topicName, messages);

    console.log(`✔️ Completed publish ${messages.length} message.`);
  });

/** クリーン対象かを確認 */
const checkCleanable = async (params: { uid: string; lastRun: string | Date; now: Date }): Promise<boolean> => {
  const { uid, lastRun, now } = params;

  // サポーターの場合は実行しない
  const role = await getStripeRole(uid);
  if (role === 'supporter') {
    return false;
  }

  // ToDo: deletedOrSuspended 確認

  // actlastRun が 90日以上前
  if (dayjs(now).diff(lastRun, 'day') >= 90) {
    return true;
  }

  // 最終閲覧日時が 180日以上前
  const lastViewing = await getUserLastViewing(uid);
  if (!lastViewing) {
    return true;
  }
  if (dayjs(now).diff(lastViewing, 'day') >= 180) {
    return true;
  }

  return false;
};

/** PubSub: ユーザーデータ削除 個々の実行 */
export const run = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 20,
    memory: '256MB',
  })
  .pubsub.topic(topicName)
  .onPublish(async (message, context) => {
    const { uid, lastRun, publishedAt } = message.json as Message;
    const now = new Date(context.timestamp);

    // 10秒以内の実行に限る
    if (checkJustPublished(now, publishedAt)) {
      console.error(`❗️[Error]: Failed to run functions: published more than 10 seconds ago.`);
      return;
    }

    const cleanable = await checkCleanable({ uid, lastRun, now });
    if (!cleanable) {
      return;
    }

    console.log(`⚙️ Starting clean user of [${uid}].`);

    const result = await deleteAuth(uid)
      .then(() => true)
      .catch(() => false);

    if (!result) {
      console.log(`ℹ︎ Already cleaned user of [${uid}].`);
      return;
    }

    console.log(`✔️ Completed clean user of [${uid}].`);
    return;
  });
