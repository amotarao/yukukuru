import * as dayjs from 'dayjs';
import * as functions from 'firebase-functions';
import { getStripeRole } from '../../modules/auth/claim';
import { getToken } from '../../modules/firestore/tokens/get';
import { setTokenInvalid } from '../../modules/firestore/tokens/set';
import { setUserResult } from '../../modules/firestore/users/state';
import { setWatch } from '../../modules/firestore/watches/setWatch';
import { getClient } from '../../modules/twitter/client';
import { checkInvalidOrExpiredToken } from '../../modules/twitter/error';
import { getFollowersIdsLegacy } from '../../modules/twitter/followers/ids';
import { getUsersLookup } from '../../modules/twitter/users/lookup';
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

  // 取得途中のユーザーはいつでも許可
  if (nextCursor !== '-1') {
    return true;
  }

  const role = await getStripeRole(uid);
  const minutes = dayjs(publishedAt).diff(dayjs(lastRun), 'minutes');

  // サポーターの場合、前回の実行から 5分経過していれば実行
  if (role === 'supporter') {
    if (minutes < 5 - 1) {
      return false;
    }
    return true;
  }

  // 前回の実行から6時間以上の間隔をあける
  if (minutes < 60 * 6 - 1) {
    return false;
  }

  // 前回の実行から72時間以上経っていたら無条件に実行する
  if (minutes > 60 * 72 - 1) {
    return true;
  }

  // ６~72時間であれば、毎回2%確率で実行
  if (Math.random() * 100 <= 2) {
    return true;
  }

  return false;
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
    const { uid, twitterId, nextCursor, lastRun, publishedAt } = message.json as Message;
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
      accessToken: token.twitterAccessToken,
      accessSecret: token.twitterAccessTokenSecret,
    });
    const result = await getFollowersIdsLegacy(client, {
      userId: twitterId,
      cursor: nextCursor,
      count: 15000, // Firestore ドキュメント データサイズ制限を考慮した数値
    });

    if ('error' in result) {
      if (checkInvalidOrExpiredToken(result.error)) {
        await setTokenInvalid(uid);
      }

      console.error(`❗️[Error]: Failed to get followers from Twitter of [${uid}].`);
      return;
    }
    console.log(`⏳ Got ${result.response.ids.length} followers from Twitter.`);

    // 凍結等チェック
    // 取得上限を迎えた場合、すべての凍結等ユーザーを網羅できない場合がある
    const { ids, next_cursor_str: newNextCursor } = result.response;
    const result2 = await getUsersLookup(client, { usersId: ids });

    if ('error' in result2) {
      if (checkInvalidOrExpiredToken(result2.error)) {
        await setTokenInvalid(uid);
      }
      console.error(`❗️[Error]: Failed to get users from Twitter of [${uid}].`);
    }
    console.log(`⏳ Got ${result.response.ids.length} users from Twitter.`);
    const errorIds = 'response' in result2 ? result2.response.errorIds : [];
    const normalIds = ids.filter((id) => !errorIds.includes(id)); // 凍結等ユーザーを除外
    console.log(`⏳ There are ${errorIds.length} error users from Twitter.`);

    // 保存
    const ended = newNextCursor === '0' || newNextCursor === '-1';
    const watchId = await setWatch(uid, normalIds, now, ended);
    await setUserResult(uid, watchId, ended, newNextCursor, now);
    console.log(`⏳ Updated state to user document of [${uid}].`);

    console.log(`✔️ Completed get followers of [${uid}].`);
  });
