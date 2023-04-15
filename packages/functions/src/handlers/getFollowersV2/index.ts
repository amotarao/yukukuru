import { User } from '@yukukuru/types';
import * as dayjs from 'dayjs';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { TwitterApiReadOnly } from 'twitter-api-v2';
import { existsSharedToken, getSharedTokensForGetFollowersV2 } from '../../modules/firestore/sharedToken';
import { setLastUsedSharedToken } from '../../modules/firestore/sharedToken';
import { getToken } from '../../modules/firestore/tokens';
import { setTwUsers } from '../../modules/firestore/twUsers';
import { getUserDocsByGroups } from '../../modules/firestore/users';
import {
  setUserTwitter,
  setUserTwitterProtected,
  setUserGetFollowersV2Status,
  setUserGetFollowersV2LastSetTwUsers,
} from '../../modules/firestore/users/state';
import { setWatchV2 } from '../../modules/firestore/watchesV2';
import { checkJustPublished } from '../../modules/functions';
import { getGroupFromTime } from '../../modules/group';
import { publishMessages } from '../../modules/pubsub';
import { getDiffDays, getDiffMinutes } from '../../modules/time';
import { convertTwitterUserToUserTwitter } from '../../modules/twitter-user-converter';
import { getFollowers, getFollowersMaxResultsMax } from '../../modules/twitter/api/followers';
import { getUser, getUsers } from '../../modules/twitter/api/users';
import { getClient } from '../../modules/twitter/client';
import { TwitterUser } from '../../modules/twitter/types';
import { publishCheckValiditySharedToken } from '../sharedToken/checkValidity';

const topicName = 'getFollowersV2';

type Message = {
  /** Firebase UID */
  uid: string;

  /** Twitter UID */
  twitterId: string;

  /** ロール */
  role: 'supporter' | null;

  /** カーソル */
  paginationToken: string | null;

  /** SetTwUsers 前回実行日時 */
  lastSetTwUsers: Date | string;

  /**
   * 共有トークン
   * 非公開アカウントでは利用できないため、null を送る
   */
  sharedToken: {
    id: string;
    accessToken: string;
    accessTokenSecret: string;
  } | null;

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
    timeoutSeconds: 20,
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
    const sharedTokens = await getSharedTokensForGetFollowersV2(
      now.subtract(15, 'minutes').toDate(),
      targetDocs.length
    );

    // publish データ作成・送信
    const messages: Message[] = targetDocs
      .map((doc, i) => {
        // SharedToken の件数が少ない場合は実行しない
        // 本番環境ではユーザーが多いので基本的には十分な件数がある
        const sharedToken = sharedTokens.at(i);
        if (!sharedToken) {
          console.log(`❗️ No shared token available for [${doc.id}]`);
          return null;
        }

        const message: Message = {
          uid: doc.id,
          twitterId: doc.data().twitter.id,
          role: doc.data().role,
          paginationToken: doc.data()._getFollowersV2Status.nextToken,
          // lastSetTwUsers が存在しない場合があるため、存在チェック
          lastSetTwUsers:
            'lastSetTwUsers' in doc.data()._getFollowersV2Status
              ? doc.data()._getFollowersV2Status.lastSetTwUsers.toDate()
              : new Date(0),
          // 非公開アカウントの場合は共有トークンを送らない
          sharedToken: doc.data().twitter.protected
            ? null
            : {
                id: sharedToken.id,
                accessToken: sharedToken.data().accessToken,
                accessTokenSecret: sharedToken.data().accessTokenSecret,
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
  (snapshot: QueryDocumentSnapshot<User>): boolean => {
    const { role, active, twitter, _getFollowersV2Status } = snapshot.data();

    // 無効なユーザーの場合は実行しない
    if (!active) {
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
      const { uid, twitterId, role, paginationToken, lastSetTwUsers, sharedToken, publishedAt } =
        message.json as Message;
      const now = new Date(context.timestamp);

      // 10秒以内の実行に限る
      if (checkJustPublished(now, publishedAt)) {
        console.error(`❗️Failed to run functions: published more than 10 seconds ago.`);
        return;
      }
      console.log(`⚙️ Starting get followers of [${uid}]. Shared token is ${sharedToken?.id ?? 'not available'}.`);

      const twitterClientWithToken = await getTwitterClientWithIdStep(sharedToken, uid);
      await checkOwnUserStatusStep(twitterClientWithToken, uid, twitterId);
      const { users, nextToken } = await getFollowersIdsStep(twitterClientWithToken, uid, twitterId, paginationToken);
      const savingTwitterUsers = await ignoreMaybeDeletedOrSuspendedStep(twitterClientWithToken, uid, users);
      await saveDocsStep(
        now,
        uid,
        savingTwitterUsers.map((user) => user.id),
        nextToken,
        sharedToken
      );
      await saveTwUsersStep(now, uid, new Date(lastSetTwUsers), role, savingTwitterUsers, nextToken === null);

      console.log(`✔️ Completed get followers of [${uid}].`);
    } catch (e) {
      console.error(e);
    }
  });

type TwitterClientWithToken = {
  client: TwitterApiReadOnly;
  token: {
    id: string;
    accessToken: string;
    accessTokenSecret: string;
  };
};

const getTwitterClientWithIdStep = async (
  sharedToken: Message['sharedToken'],
  uid: string
): Promise<TwitterClientWithToken> => {
  if (sharedToken) {
    return {
      client: getClient({
        accessToken: sharedToken.accessToken,
        accessSecret: sharedToken.accessTokenSecret,
      }),
      token: sharedToken,
    };
  }

  const token = await getToken(uid);
  if (!token) {
    throw new Error('❗️No token.');
  }
  return {
    client: getClient({
      accessToken: token.twitterAccessToken,
      accessSecret: token.twitterAccessTokenSecret,
    }),
    token: {
      id: uid,
      accessToken: token.twitterAccessToken,
      accessTokenSecret: token.twitterAccessTokenSecret,
    },
  };
};

/**
 * 自身のアカウント状態を確認
 * 削除または凍結されている場合は、処理を中断する
 */
const checkOwnUserStatusStep = async (
  { client, token }: TwitterClientWithToken,
  uid: string,
  twitterId: string
): Promise<void> => {
  const response = await getUser(client, twitterId);
  if ('error' in response) {
    await publishCheckValiditySharedToken(token);
    throw new Error(`❗️An error occurred while retrieving own status.`);
  }
  if ('errorUser' in response) {
    throw new Error(`❗️Own is deleted or suspended.`);
  }

  const user = response.user;
  if (user) {
    await setUserTwitter(uid, convertTwitterUserToUserTwitter(user));
  }
};

/**
 * フォロワーIDリストの取得
 */
const getFollowersIdsStep = async (
  { client, token }: TwitterClientWithToken,
  uid: string,
  twitterId: string,
  nextToken: string | null
) => {
  const response = await getFollowers(client, {
    userId: twitterId,
    paginationToken: nextToken,
    maxResults: getFollowersMaxResultsMax * 10, // Firestore ドキュメントデータサイズ制限、Twitter API 取得制限を考慮した数値
  });

  // 非公開アカウントと思われる場合、Authorization Error となる
  if ('authorizationError' in response) {
    await setUserTwitterProtected(uid);
    throw new Error('❗️Authorization Error. Maybe protected user.');
  }

  if ('error' in response) {
    await publishCheckValiditySharedToken(token);
    const message = `❗️Failed to get users from Twitter of [${uid}].`;
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
  { client }: TwitterClientWithToken,
  uid: string,
  followers: TwitterUser[]
): Promise<TwitterUser[]> => {
  const followersIds = followers.map((follower) => follower.id);
  const response = await getUsers(client, followersIds);

  if ('error' in response) {
    const message = `❗️Failed to get users from Twitter of [${uid}].`;
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
  followersIds: string[],
  nextToken: string | null,
  sharedToken: Message['sharedToken']
): Promise<void> => {
  const ended = nextToken === null;
  await Promise.all([
    setWatchV2(uid, followersIds, now, ended),
    setUserGetFollowersV2Status(uid, nextToken, ended, now),
    existsSharedToken(sharedToken ? sharedToken.id : uid).then(() => {
      setLastUsedSharedToken(sharedToken ? sharedToken.id : uid, ['v2_getUserFollowers', 'v2_getUsers'], now);
    }),
  ]);
  console.log(`⏳ Updated state to user document of [${uid}].`);
};

/**
 * TwUsers の保存
 * 書き込み件数が多すぎるので、回数を調整している
 */
const saveTwUsersStep = async (
  now: Date,
  uid: string,
  lastSetTwUsers: Date,
  role: 'supporter' | null,
  twitterUsers: TwitterUser[],
  ended: boolean
) => {
  const days = getDiffDays(now, lastSetTwUsers);

  // サポーターは7日以上間隔をあける
  if (role === 'supporter' && days <= 7) {
    return;
  }
  // サポーター以外は30日以上間隔をあける
  if (role === null && days <= 30) {
    return;
  }

  await setTwUsers(twitterUsers);
  ended && (await setUserGetFollowersV2LastSetTwUsers(uid, now));
};
