import * as dayjs from 'dayjs';
import * as functions from 'firebase-functions';
import { getStripeRole } from '../../modules/auth/claim';
import { getToken } from '../../modules/firestore/tokens/get';
import { setTokenInvalid } from '../../modules/firestore/tokens/set';
import { setUserResult } from '../../modules/firestore/users/state';
import { setWatch } from '../../modules/firestore/watches/setWatch';
import { getClient } from '../../modules/twitter/client';
import { checkInvalidToken } from '../../modules/twitter/error';
import { getFollowersIds } from '../../modules/twitter/followers/ids';
import { topicName, Message } from './_pubsub';

/**
 * 直前に publish されたかどうかを確認
 */
const checkJustPublished = (now: string | Date, published: string | Date, diffMs: number = 1000 * 10): boolean => {
  return new Date(now).getTime() - new Date(published).getTime() > diffMs;
};

/**
 * 実行可能かどうかを確認
 */
const checkExecutable = async (params: {
  uid: string;
  nextCursor: string;
  lastRun: string | Date;
  publishedAt: string | Date;
}): Promise<boolean> => {
  const { uid, nextCursor, lastRun, publishedAt } = params;

  // 取得途中のユーザーは許可
  if (nextCursor !== '-1') {
    return true;
  }

  const role = await getStripeRole(uid);
  const minutes = dayjs(publishedAt).diff(dayjs(lastRun), 'minutes');

  // サポーターの場合、前回の実行から15分経過していれば実行
  if (role === 'supporter') {
    if (minutes < 15 - 1) {
      return false;
    }
    return true;
  }

  // サポーター以外の場合、前回の実行から60分経過していれば実行
  if (minutes < 60 - 1) {
    return false;
  }
  return true;
};

/** PubSub: フォロワー取得 個々の実行 */
export const run = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 20,
    memory: '256MB',
  })
  .pubsub.topic(topicName)
  .onPublish(async (message, context) => {
    const { uid, nextCursor, lastRun, publishedAt } = message.json as Message;
    const now = new Date(context.timestamp);

    // 10秒以内の実行に限る
    if (checkJustPublished(now, publishedAt)) {
      console.error(`❗️[Error]: Failed to run functions: published more than 10 seconds ago.`);
      return;
    }

    // 実行可能かを確認
    const executable = await checkExecutable({ uid, nextCursor, lastRun, publishedAt });
    if (!executable) {
      console.log(`[Info]: Canceled get followers of [${uid}].`);
      return;
    }
    console.log(`⚙️ Starting get followers of [${uid}].`);

    // Twitter Token を取得
    const token = await getToken(uid);
    if (token === null) {
      console.error(`❗️[Error]: Failed to get token of [${uid}]: Token is not exists.`);
      return;
    }
    console.log(`⏳ Got token from Firestore.`);

    // フォロワーIDリストを取得
    const client = getClient({
      access_token_key: token.twitterAccessToken,
      access_token_secret: token.twitterAccessTokenSecret,
    });
    const result = await getFollowersIds(client, {
      userId: token.twitterId,
      cursor: nextCursor,
      count: 30000, // Firestore ドキュメント データサイズ制限を考慮した数値
    });

    if ('errors' in result) {
      console.error(`❗️[Error]: Failed to get users from Twitter of [${uid}].`, result.errors);

      if (checkInvalidToken(result.errors)) {
        await setTokenInvalid(uid);
      }
      return;
    }
    console.log(`⏳ Got ${result.response.ids.length} users from Twitter.`);

    // 保存
    const { ids, next_cursor_str: newNextCursor } = result.response;
    const ended = newNextCursor === '0' || newNextCursor === '-1';
    const watchId = await setWatch(uid, ids, now, ended);
    await setUserResult(uid, watchId, ended, newNextCursor, now);

    console.log(`⏳ Updated state to user document of [${uid}].`);

    console.log(`✔️ Completed get followers of [${uid}].`);
  });
