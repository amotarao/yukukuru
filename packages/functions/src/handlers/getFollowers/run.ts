import * as functions from 'firebase-functions';
import { EApiV1ErrorCode } from 'twitter-api-v2';
import { setLastUsedSharedToken } from '../../modules/firestore/sharedToken';
import { setUserResult, setUserResultLegacy } from '../../modules/firestore/users/state';
import { setWatch } from '../../modules/firestore/watches/setWatch';
import { getClient } from '../../modules/twitter/client';
import { getFollowersIdsLegacy, getFollowersIdsLegacyMaxResultsMax } from '../../modules/twitter/followers/ids';
import { getUsersLookup } from '../../modules/twitter/users/lookup';
import { getFollowers, getFollowersMaxResultsMax } from './../../modules/twitter/followers/followers';
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
    timeoutSeconds: 40,
    memory: '256MB',
  })
  .pubsub.topic(topicName)
  .onPublish(async (message, context) => {
    try {
      const {
        uid,
        twitterId,
        nextCursor: getFollowersNextCursor,
        getFollowersNextToken,
        sharedToken,
        publishedAt,
      } = message.json as Message;
      const now = new Date(context.timestamp);

      // 10秒以内の実行に限る
      if (checkJustPublished(now, publishedAt)) {
        console.error(`❗️[Error]: Failed to run functions: published more than 10 seconds ago.`);
        return;
      }
      console.log(`⚙️ Starting get followers of [${uid}].`);

      const isLegacy = getFollowersNextCursor !== '-1' && getFollowersNextCursor !== null;

      if (isLegacy) {
        const { ids, next_cursor_str: nextCursor } = await getFollowersIdsStepLegacy(
          now,
          uid,
          twitterId,
          getFollowersNextCursor,
          sharedToken
        );
        const savingIds = await ignoreMaybeDeletedOrSuspendedStep(uid, ids, sharedToken);
        await saveDocsStepLegacy(now, uid, savingIds, nextCursor, sharedToken);
      } else {
        const { users, nextToken } = await getFollowersIdsStep(uid, twitterId, getFollowersNextToken, sharedToken);
        const savingIds = await ignoreMaybeDeletedOrSuspendedStep(
          uid,
          users.map((user) => user.id),
          sharedToken
        );
        await saveDocsStep(now, uid, savingIds, nextToken, sharedToken);
      }
      console.log(`✔️ Completed get followers of [${uid}].`);
    } catch (e) {
      console.error(e);
    }
  });

/**
 * フォロワーIDリストの取得
 */
const getFollowersIdsStepLegacy = async (
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
    // v1.1 API は原因不明の InternalError が発生することがあるため、最終使用日時を更新して、処理を中断する
    if (result.error.hasErrorCode(EApiV1ErrorCode.InternalError)) {
      await setLastUsedSharedToken(sharedToken.id, ['v1_getFollowersIds', 'v2_getUsers'], now);
    }
    const message = `❗️[Error]: Failed to get users from Twitter of [${uid}]. Shared token id is [${sharedToken.id}].`;
    throw new Error(message);
  }

  console.log(`⏳ Got ${result.response.ids.length} followers from Twitter.`);
  return result.response;
};

/**
 * フォロワーIDリストの取得
 */
const getFollowersIdsStep = async (
  uid: string,
  twitterId: string,
  nextToken: string | null,
  sharedToken: Message['sharedToken']
) => {
  const sharedClient = getClient({
    accessToken: sharedToken.accessToken,
    accessSecret: sharedToken.accessTokenSecret,
  });

  const result = await getFollowers(sharedClient, {
    userId: twitterId,
    maxResults: getFollowersMaxResultsMax * 10, // Firestore ドキュメントデータサイズ制限、Twitter API 取得制限を考慮した数値
    paginationToken: nextToken,
  });

  if ('error' in result) {
    const message = `❗️[Error]: Failed to get users from Twitter of [${uid}]. Shared token id is [${sharedToken.id}].`;
    throw new Error(message);
  }

  console.log(`⏳ Got ${result.response.users.length} followers from Twitter.`);
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
const saveDocsStepLegacy = async (
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

/**
 * 結果をドキュメント保存
 */
const saveDocsStep = async (
  now: Date,
  uid: string,
  ids: string[],
  nextToken: string | null,
  sharedToken: Message['sharedToken']
): Promise<void> => {
  const ended = nextToken === null;
  const watchId = await setWatch(uid, ids, now, ended);
  await setUserResult(uid, watchId, ended, nextToken, now);
  await setLastUsedSharedToken(sharedToken.id, ['v2_getUserFollowers', 'v2_getUsers'], now);
  console.log(`⏳ Updated state to user document of [${uid}].`);
};
