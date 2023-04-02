import dayjs = require('dayjs');
import * as functions from 'firebase-functions';
import { EApiV1ErrorCode } from 'twitter-api-v2';
import { setLastUsedSharedToken } from '../../modules/firestore/sharedToken';
import { setUserResultLegacy } from '../../modules/firestore/users/state';
import { setWatch } from '../../modules/firestore/watches/setWatch';
import { getClient } from '../../modules/twitter/client';
import { getFollowersIdsLegacy, getFollowersIdsLegacyMaxResultsMax } from '../../modules/twitter/followers/ids';
import { getUsersLookup } from '../../modules/twitter/users/lookup';
import { topicName, Message } from './_pubsub';

/**
 * 直前に publish されたかどうかを確認
 */
const checkJustPublished = (now: string | Date, published: string | Date, diffMs: number = 1000 * 10): boolean => {
  return new Date(now).getTime() - new Date(published).getTime() > diffMs;
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
      const { uid, twitterId, nextCursor, sharedToken, publishedAt } = message.json as Message;
      const now = new Date(context.timestamp);

      // 10秒以内の実行に限る
      if (checkJustPublished(now, publishedAt)) {
        console.error(`❗️[Error]: Failed to run functions: published more than 10 seconds ago.`);
        return;
      }
      console.log(`⚙️ Starting get followers of [${uid}].`);

      const { ids, next_cursor_str: newNextCursor } = await getFollowersIdsStep(
        now,
        uid,
        twitterId,
        nextCursor,
        sharedToken
      );
      const savingIds = await ignoreMaybeDeletedOrSuspendedStep(uid, ids, sharedToken);
      await saveDocsStep(now, uid, savingIds, newNextCursor, sharedToken);

      console.log(`✔️ Completed get followers of [${uid}].`);
    } catch (e) {
      console.error(e);
    }
  });

/**
 * フォロワーIDリストの取得
 */
const getFollowersIdsStep = async (
  now: Date,
  uid: string,
  twitterId: string,
  nextCursor: string,
  sharedToken: Message['sharedToken']
) => {
  const sharedClient = getClient({
    accessToken: sharedToken.accessToken,
    accessSecret: sharedToken.accessTokenSecret,
  });

  const result = await getFollowersIdsLegacy(sharedClient, {
    userId: twitterId,
    cursor: nextCursor,
    count: getFollowersIdsLegacyMaxResultsMax * 3, // Firestore ドキュメントデータサイズ制限、Twitter API 取得制限を考慮した数値
  });

  if ('error' in result) {
    // v1.1 API は原因不明の InternalError が発生することがあるため、最終使用日時を1日後に更新して、処理を中断する
    if (result.error.hasErrorCode(EApiV1ErrorCode.InternalError)) {
      await setLastUsedSharedToken(sharedToken.id, ['v1_getFollowersIds'], dayjs(now).add(1, 'd').toDate());
    }
    // v1.1 API は v2 と違い、アカウントロックのエラーが発生することがあるため、最終使用日時を1週間後に更新して、処理を中断する
    if (result.error.hasErrorCode(EApiV1ErrorCode.AccountLocked)) {
      await setLastUsedSharedToken(sharedToken.id, ['v1_getFollowersIds'], dayjs(now).add(1, 'w').toDate());
    }
    const message = `❗️[Error]: Failed to get users from Twitter of [${uid}]. Shared token id is [${sharedToken.id}].`;
    throw new Error(message);
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
  uid: string,
  ids: string[],
  sharedToken: Message['sharedToken']
): Promise<string[]> => {
  const sharedClient = getClient({
    accessToken: sharedToken.accessToken,
    accessSecret: sharedToken.accessTokenSecret,
  });

  const result = await getUsersLookup(sharedClient, { usersId: ids });

  if ('error' in result) {
    const message = `❗️[Error]: Failed to get users from Twitter of [${uid}]. Shared token id is [${sharedToken.id}].`;
    console.error(message);
    return ids;
  }
  const errorIds = result.response.errorIds;
  const ignoredIds = ids.filter((id) => !errorIds.includes(id)); // 凍結等ユーザーを除外
  console.log(`⏳ There are ${errorIds.length} error users from Twitter.`);
  return ignoredIds;
};

/**
 * 結果をドキュメント保存
 */
const saveDocsStep = async (
  now: Date,
  uid: string,
  ids: string[],
  nextCursor: string,
  sharedToken: Message['sharedToken']
): Promise<void> => {
  const ended = nextCursor === '0' || nextCursor === '-1';
  const watchId = await setWatch(uid, ids, now, ended);
  await setUserResultLegacy(uid, watchId, ended, nextCursor, now);
  await setLastUsedSharedToken(sharedToken.id, ['v1_getFollowersIds', 'v2_getUsers'], now);
  console.log(`⏳ Updated state to user document of [${uid}].`);
};
