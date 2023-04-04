import * as dayjs from 'dayjs';
import * as functions from 'firebase-functions';
import { EApiV1ErrorCode } from 'twitter-api-v2';
import { setLastUsedSharedToken } from '../../modules/firestore/sharedToken';
import { getToken } from '../../modules/firestore/tokens';
import { setUserResultLegacy } from '../../modules/firestore/users/state';
import { setWatch } from '../../modules/firestore/watches/set';
import { checkJustPublished } from '../../modules/functions';
import { publishMessages } from '../../modules/pubsub';
import {
  getFollowersIdsLegacy,
  getFollowersIdsLegacyMaxResultsMax,
} from '../../modules/twitter/api-legacy/followers-ids';
import { getUsers } from '../../modules/twitter/api/users';
import { getClient } from '../../modules/twitter/client';
import { topicName, Message } from './_pubsub';

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
        console.error(`❗️Failed to run functions: published more than 10 seconds ago.`);
        return;
      }
      console.log(`⚙️ Starting get followers of [${uid}].`);

      await checkOwnUserStatus(twitterId, sharedToken);
      const { ids, next_cursor_str: newNextCursor } = await getFollowersIdsStep(
        now,
        uid,
        twitterId,
        nextCursor,
        sharedToken,
        message.json as Message
      );
      const savingIds = await ignoreMaybeDeletedOrSuspendedStep(uid, ids, sharedToken);
      await saveDocsStep(now, uid, savingIds, newNextCursor, sharedToken);

      console.log(`✔️ Completed get followers of [${uid}].`);
    } catch (e) {
      console.error(e);
    }
  });

/**
 * 自身のアカウント状態を確認
 * 削除または凍結されている場合は、処理を中断する
 */
const checkOwnUserStatus = async (twitterId: string, sharedToken: Message['sharedToken']): Promise<void> => {
  const sharedClient = getClient({
    accessToken: sharedToken.accessToken,
    accessSecret: sharedToken.accessTokenSecret,
  });

  const response = await getUsers(sharedClient, [twitterId]);
  if ('error' in response) {
    throw new Error(`❗️An error occurred while retrieving own status.`);
  }
  if (response.errorUsers.length > 0) {
    throw new Error(`❗️Own is deleted or suspended.`);
  }
};

/**
 * フォロワーIDリストの取得
 */
const getFollowersIdsStep = async (
  now: Date,
  uid: string,
  twitterId: string,
  nextCursor: string,
  sharedToken: Message['sharedToken'],
  message: Message
) => {
  const sharedClient = getClient({
    accessToken: sharedToken.accessToken,
    accessSecret: sharedToken.accessTokenSecret,
  });

  const response = await getFollowersIdsLegacy(sharedClient, {
    userId: twitterId,
    cursor: nextCursor,
    count: getFollowersIdsLegacyMaxResultsMax * 3, // Firestore ドキュメントデータサイズ制限、Twitter API 取得制限を考慮した数値
  });

  // 非公開ユーザーの場合、Internal Error となる
  // 自身のトークンを使用して再度実行する
  if ('error' in response && response.error.hasErrorCode(EApiV1ErrorCode.InternalError)) {
    const token = await getToken(uid);
    if (token) {
      const newMessage: Message = {
        ...message,
        sharedToken: {
          id: uid,
          accessToken: token.twitterAccessToken,
          accessTokenSecret: token.twitterAccessTokenSecret,
        },
      };
      await publishMessages(topicName, [newMessage]);
      throw new Error(`🔄 Retry get followers ids of [${uid}].`);
    }
  }

  if ('error' in response) {
    // v1.1 API は v2 と違い、アカウントロックのエラーが発生することがあるため、最終使用日時を1週間後に更新して、処理を中断する
    if (response.error.hasErrorCode(EApiV1ErrorCode.AccountLocked)) {
      await setLastUsedSharedToken(sharedToken.id, ['v2_getUserFollowers'], dayjs(now).add(1, 'w').toDate());
    }
    const message = `❗️Failed to get users from Twitter of [${uid}]. Shared token id is [${sharedToken.id}].`;
    throw new Error(message);
  }

  console.log(`⏳ Got ${response.ids.length} followers from Twitter.`);
  return response;
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

  const response = await getUsers(sharedClient, ids);

  if ('error' in response) {
    const message = `❗️Failed to get users from Twitter of [${uid}]. Shared token id is [${sharedToken.id}].`;
    console.error(message);
    return ids;
  }
  const errorIds = response.errorUsers.map((errorUser) => errorUser.id);
  const ignoredIds = ids.filter((id) => !errorIds.includes(id));
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
  await setLastUsedSharedToken(sharedToken.id, ['v2_getUserFollowers', 'v2_getUsers'], now);
  console.log(`⏳ Updated state to user document of [${uid}].`);
};
