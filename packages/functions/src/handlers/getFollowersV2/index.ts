import { UserData } from '@yukukuru/types';
import * as dayjs from 'dayjs';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { getSharedTokensForGetFollowersV2 } from '../../modules/firestore/sharedToken';
import { setLastUsedSharedToken } from '../../modules/firestore/sharedToken';
import { getToken } from '../../modules/firestore/tokens/get';
import { setTwUsers } from '../../modules/firestore/twUsers';
import { getUserDocsByGroups } from '../../modules/firestore/users';
import { setUesrTwitter, setUserGetFollowersV2Status } from '../../modules/firestore/users/state';
import { setWatchV2 } from '../../modules/firestore/watchesV2';
import { checkJustPublished } from '../../modules/functions';
import { getGroupFromTime } from '../../modules/group';
import { publishMessages } from '../../modules/pubsub/publish';
import { convertTwitterUserToUserDataTwitter } from '../../modules/twitter-user-converter';
import { getFollowers, getFollowersMaxResultsMax } from '../../modules/twitter/api/followers';
import { getUsers } from '../../modules/twitter/api/users';
import { getClient } from '../../modules/twitter/client';
import { TwitterUser } from '../../modules/twitter/types';
import { getDiffMinutes } from '../../utils/time';

const topicName = 'getFollowersV2';

type Message = {
  /** Firebase UID */
  uid: string;

  /** Twitter UID */
  twitterId: string;

  /** カーソル */
  paginationToken: string | null;

  /** 共有トークン */
  sharedToken: {
    id: string;
    accessToken: string;
    accessTokenSecret: string;
  };

  /** 送信日時 */
  publishedAt: Date | string;
};

/**
 * フォロワー取得 定期実行
 *
 * 毎分実行
 * グループ毎に 3分おきに実行
 */
export const publish = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = dayjs(context.timestamp);

    // 対象ユーザーの取得
    const groups = [
      getGroupFromTime(1, now.toDate()),
      getGroupFromTime(1, now.add(3, 'minutes').toDate()),
      getGroupFromTime(1, now.add(6, 'minutes').toDate()),
      getGroupFromTime(1, now.add(9, 'minutes').toDate()),
      getGroupFromTime(1, now.add(12, 'minutes').toDate()),
    ];
    const docs = await getUserDocsByGroups(groups);
    const targetDocs = docs.filter(filterExecutable(now.toDate()));
    const sharedTokens = await getSharedTokensForGetFollowersV2(now.toDate(), targetDocs.length);

    // publish データ作成・送信
    const messages: Message[] = targetDocs
      .map((doc, i) => {
        const sharedToken = sharedTokens.at(i);
        if (!sharedToken) {
          console.log(`❗️ No shared token available for [${doc.id}]`);
          return null;
        }
        const message: Message = {
          uid: doc.id,
          twitterId: doc.data().twitter.id,
          paginationToken: doc.data()._getFollowersV2Status.nextToken,
          sharedToken: {
            id: sharedToken.id,
            accessToken: sharedToken.data.accessToken,
            accessTokenSecret: sharedToken.data.accessTokenSecret,
          },
          publishedAt: now.toDate(),
        };
        return message;
      })
      .filter((message): message is Message => message !== null);
    await publishMessages(topicName, messages);

    console.log(`✔️ Completed publish ${messages.length} message.`);
  });

/** 実行可能かどうかを確認 */
const filterExecutable =
  (now: Date) =>
  (snapshot: QueryDocumentSnapshot<UserData>): boolean => {
    const { role, active, deletedAuth, twitter, _getFollowersV2Status } = snapshot.data();

    // 無効または削除済みユーザーの場合は実行しない
    if (!active || deletedAuth) {
      return false;
    }

    const minutes = getDiffMinutes(now, _getFollowersV2Status.lastRun.toDate());

    // 公開アカウントでは 3分の間隔を開ける
    if (!twitter.protected && minutes < 3) {
      return false;
    }
    // 非公開アカウントでは 15分の間隔を開ける
    if (twitter.protected && minutes < 15) {
      return false;
    }

    // 取得途中のユーザーはいつでも許可
    if (_getFollowersV2Status.nextToken !== null) {
      return true;
    }

    // サポーターの場合はいつでも許可
    if (role === 'supporter') {
      return true;
    }

    // 前回の実行から6時間以上の間隔をあける
    if (minutes < 60 * 6) {
      return false;
    }

    // 前回の実行から72時間以上経っていたら無条件に実行する
    if (minutes >= 60 * 72) {
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
    timeoutSeconds: 45,
    memory: '512MB',
  })
  .pubsub.topic(topicName)
  .onPublish(async (message, context) => {
    try {
      const { uid, twitterId, paginationToken, sharedToken, publishedAt } = message.json as Message;
      const now = new Date(context.timestamp);

      // 10秒以内の実行に限る
      if (checkJustPublished(now, publishedAt)) {
        console.error(`❗️Failed to run functions: published more than 10 seconds ago.`);
        return;
      }
      console.log(`⚙️ Starting get followers of [${uid}].`);

      await checkOwnUserStatus(uid, twitterId, sharedToken);
      const { users, nextToken } = await getFollowersIdsStep(
        now,
        uid,
        twitterId,
        paginationToken,
        sharedToken,
        message.json as Message
      );
      const savingIds = await ignoreMaybeDeletedOrSuspendedStep(uid, users, sharedToken);
      await saveDocsStep(now, uid, savingIds, nextToken, sharedToken);

      console.log(`✔️ Completed get followers of [${uid}].`);
    } catch (e) {
      console.error(e);
    }
  });

/**
 * 自身のアカウント状態を確認
 * 削除または凍結されている場合は、処理を中断する
 */
const checkOwnUserStatus = async (
  uid: string,
  twitterId: string,
  sharedToken: Message['sharedToken']
): Promise<void> => {
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

  const user = response.users[0];
  if (user) {
    await setUesrTwitter(uid, convertTwitterUserToUserDataTwitter(user));
  }
};

/**
 * フォロワーIDリストの取得
 */
const getFollowersIdsStep = async (
  now: Date,
  uid: string,
  twitterId: string,
  nextToken: string | null,
  sharedToken: Message['sharedToken'],
  message: Message
) => {
  const sharedClient = getClient({
    accessToken: sharedToken.accessToken,
    accessSecret: sharedToken.accessTokenSecret,
  });

  const response = await getFollowers(sharedClient, {
    userId: twitterId,
    paginationToken: nextToken,
    maxResults: getFollowersMaxResultsMax * 10, // Firestore ドキュメントデータサイズ制限、Twitter API 取得制限を考慮した数値
  });

  // 非公開ユーザーの場合、Authorization Error となる
  // 自身のトークンを使用して再度実行する
  if ('authorizationError' in response) {
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
    throw new Error('❗️Failed to get own token.');
  }

  if ('error' in response) {
    const message = `❗️Failed to get users from Twitter of [${uid}]. Shared token id is [${sharedToken.id}].`;
    throw new Error(message);
  }

  console.log(`⏳ Got ${response.users.length} followers from Twitter.`);
  return response;
};

/**
 * 凍結ユーザーの除外
 * レスポンスに入るが、実際には凍結されているユーザーがいるため、その対応
 * ただし、取得上限を迎えた場合、すべての凍結等ユーザーを網羅できない場合がある
 */
const ignoreMaybeDeletedOrSuspendedStep = async (
  uid: string,
  followers: TwitterUser[],
  sharedToken: Message['sharedToken']
): Promise<TwitterUser[]> => {
  const sharedClient = getClient({
    accessToken: sharedToken.accessToken,
    accessSecret: sharedToken.accessTokenSecret,
  });

  const followersIds = followers.map((follower) => follower.id);
  const response = await getUsers(sharedClient, followersIds);

  if ('error' in response) {
    const message = `❗️Failed to get users from Twitter of [${uid}]. Shared token id is [${sharedToken.id}].`;
    console.error(message);
    return followers;
  }
  const errorIds = response.errorUsers.map((errorUser) => errorUser.id);
  const ignoredFollowers = followers.filter((follower) => !errorIds.includes(follower.id));
  console.log(`⏳ There are ${errorIds.length} error users from Twitter.`);
  return ignoredFollowers;
};

/**
 * 結果をドキュメント保存
 */
const saveDocsStep = async (
  now: Date,
  uid: string,
  followers: TwitterUser[],
  nextToken: string | null,
  sharedToken: Message['sharedToken']
): Promise<void> => {
  const ended = nextToken === null;
  const followersIds = followers.map((follower) => follower.id);
  await Promise.all([
    setWatchV2(uid, followersIds, now, ended),
    setUserGetFollowersV2Status(uid, nextToken, ended, now),
    setLastUsedSharedToken(sharedToken.id, ['v2_getUserFollowers', 'v2_getUsers'], now),
  ]);
  console.log(`⏳ Updated state to user document of [${uid}].`);
  await setTwUsers(followers);
};
