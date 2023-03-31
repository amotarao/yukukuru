import * as dayjs from 'dayjs';
import * as functions from 'firebase-functions';
import { TwitterApiReadOnly } from 'twitter-api-v2';
import { getStripeRole } from '../../modules/auth/claim';
import { getToken } from '../../modules/firestore/tokens/get';
import { setTokenInvalid } from '../../modules/firestore/tokens/set';
import { setUserResultLegacy } from '../../modules/firestore/users/state';
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
    try {
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

      const client = await getTwitterClientStep(uid);
      const { ids, next_cursor_str: newNextCursor } = await getFollowersIdsStep(client, uid, twitterId, nextCursor);
      const savingIds = await ignoreMaybeDeletedOrSuspendedStep(client, uid, ids);
      await saveDocsStep(now, uid, savingIds, newNextCursor);

      console.log(`✔️ Completed get followers of [${uid}].`);
    } catch (e) {
      console.error(e);
    }
  });

/**
 * Firestore からユーザーの token を取得し、Twitter Client を生成
 */
const getTwitterClientStep = async (uid: string) => {
  const token = await getToken(uid);
  if (token === null) {
    throw new Error(`❗️[Error]: Failed to get token of [${uid}]: Token is not exists.`);
  }
  console.log(`⏳ Got token from Firestore.`);

  const client = getClient({
    accessToken: token.twitterAccessToken,
    accessSecret: token.twitterAccessTokenSecret,
  });
  return client;
};

/**
 * フォロワーIDリストの取得
 */
const getFollowersIdsStep = async (client: TwitterApiReadOnly, uid: string, twitterId: string, nextCursor: string) => {
  const result = await getFollowersIdsLegacy(client, {
    userId: twitterId,
    cursor: nextCursor,
    count: getFollowersIdsLegacyMaxResultsMax * 3, // Firestore ドキュメントデータサイズ制限、Twitter API 取得制限を考慮した数値
  });

  if ('error' in result) {
    if (checkInvalidOrExpiredToken(result.error)) {
      await setTokenInvalid(uid);
    }

    throw new Error(`❗️[Error]: Failed to get followers from Twitter of [${uid}].`);
  }

  console.log(`⏳ Got ${result.response.ids.length} followers from Twitter.`);
  return result.response;
};

/**
 * 凍結ユーザーの除外
 * レスポンスに入るが、実際には凍結されているユーザーがいるため、その対応
 * ただし、取得上限を迎えた場合、すべての凍結等ユーザーを網羅できない場合がある
 */
const ignoreMaybeDeletedOrSuspendedStep = async (
  client: TwitterApiReadOnly,
  uid: string,
  ids: string[]
): Promise<string[]> => {
  const result2 = await getUsersLookup(client, { usersId: ids });

  if ('error' in result2) {
    if (checkInvalidOrExpiredToken(result2.error)) {
      await setTokenInvalid(uid);
    }
    console.error(`❗️[Error]: Failed to get users from Twitter of [${uid}].`);
    return ids;
  }
  const errorIds = result2.response.errorIds;
  const ignoredIds = ids.filter((id) => !errorIds.includes(id)); // 凍結等ユーザーを除外
  console.log(`⏳ There are ${errorIds.length} error users from Twitter.`);
  return ignoredIds;
};

/**
 * 結果をドキュメント保存
 */
const saveDocsStep = async (now: Date, uid: string, ids: string[], nextCursor: string): Promise<void> => {
  const ended = nextCursor === '0' || nextCursor === '-1';
  const watchId = await setWatch(uid, ids, now, ended);
  await setUserResultLegacy(uid, watchId, ended, nextCursor, now);
  console.log(`⏳ Updated state to user document of [${uid}].`);
};
