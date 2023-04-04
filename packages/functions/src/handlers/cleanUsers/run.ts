import * as dayjs from 'dayjs';
import * as functions from 'firebase-functions';
import { getStripeRole } from '../../modules/auth/claim';
import { deleteAuth } from '../../modules/auth/delete';
import { getUserLastViewing } from '../../modules/firestore/userStatuses/lastViewing';
import { getWatchesIds } from '../../modules/firestore/watches/getWatches';
import { removeWatches } from '../../modules/firestore/watches/removeWatches';
import { checkJustPublished } from '../../modules/functions';
import { topicName, Message } from './_pubsub';

/**
 * 実行可能かどうかを確認
 */

const checkExecutable = async (params: {
  uid: string;
  active: boolean;
  deletedAuth: boolean;
  lastUpdated: string | Date;
  followersCount: number;
  now: Date;
}): Promise<boolean> => {
  const { uid, active, deletedAuth, lastUpdated, followersCount, now } = params;

  // サポーターの場合は実行しない
  const role = await getStripeRole(uid);
  if (role === 'supporter') {
    return false;
  }

  // 既に削除されている場合は実行しない
  if (deletedAuth) {
    return false;
  }

  // active が false かつ lastUpdated が 30日以上前
  if (!active && dayjs(now).diff(lastUpdated, 'day') >= 30) {
    return true;
  }

  // active が true かつ lastUpdated が 90日以上前
  if (active && dayjs(now).diff(lastUpdated, 'day') >= 90) {
    return true;
  }

  // フォロワー 1000 人以上 かつ 最終閲覧日時が 180日以上前
  const lastViewing = await getUserLastViewing(uid);
  if (followersCount >= 1000) {
    if (!lastViewing) {
      return true;
    }
    if (dayjs(now).diff(lastViewing, 'day') >= 180) {
      return true;
    }
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
    const { uid, active, deletedAuth, lastUpdated, followersCount, publishedAt } = message.json as Message;
    const now = new Date(context.timestamp);

    // 10秒以内の実行に限る
    if (checkJustPublished(now, publishedAt)) {
      console.error(`❗️[Error]: Failed to run functions: published more than 10 seconds ago.`);
      return;
    }

    const executable = await checkExecutable({ uid, active, deletedAuth, lastUpdated, followersCount, now });
    if (!executable) {
      return;
    }

    console.log(`⚙️ Starting clean user of [${uid}].`);

    const watchIds = await getWatchesIds(uid, 300);
    await removeWatches({ uid, removeIds: watchIds });

    if (watchIds.length > 0) {
      console.log(`✔️ Completed remove ${watchIds.length} watches of [${uid}].`);
    }

    const afterWatches = await getWatchesIds(uid, 1);

    if (afterWatches.length > 0) {
      console.log(`✔️ Completed (paused) clean user of [${uid}].`);
      return;
    }

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
