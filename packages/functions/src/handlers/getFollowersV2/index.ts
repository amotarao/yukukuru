import { StripeRole, User } from '@yukukuru/types';
import * as dayjs from 'dayjs';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { TwitterApiReadOnly } from 'twitter-api-v2';
import { checkExistsSharedToken, getSharedTokensForGetFollowersV2 } from '../../modules/firestore/sharedToken';
import { updateLastUsedSharedToken } from '../../modules/firestore/sharedToken';
import { getToken } from '../../modules/firestore/tokens';
import { setTwUsers } from '../../modules/firestore/twUsers';
import { getUserDocsByGroups, updateTokenStatusOfUser, updateTwiterStatusOfUser } from '../../modules/firestore/users';
import { existsUser } from '../../modules/firestore/users/exists';
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
import { getUser } from '../../modules/twitter/api/users';
import { getClient } from '../../modules/twitter/client';
import { TwitterUser } from '../../modules/twitter/types';
import { publishCheckValiditySharedToken } from '../sharedToken/checkValidity';

const topicName = 'getFollowersV2';

type Message = {
  /** Firebase UID */
  uid: string;

  /** Twitter UID */
  twitterId: string;

  /** 非公開かどうか */
  twitterProtected: boolean;

  /** ロール */
  role: StripeRole;

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
          twitterProtected: doc.data().twitter.protected,
          role: doc.data().role,
          paginationToken: doc.data()._getFollowersV2Status.nextToken,
          lastSetTwUsers: doc.data()._getFollowersV2Status.lastSetTwUsers.toDate(),
          sharedToken: {
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
    const { role, twitter, _twitterStatus, _tokenStatus, _getFollowersV2Status } = snapshot.data();

    const minutes = getDiffMinutes(now, _getFollowersV2Status.lastRun.toDate());

    // 公開アカウントでは 3分の間隔を開ける
    if (!twitter.protected && minutes < 3) {
      return false;
    }
    // 非公開アカウントでは 15分の間隔を開ける
    if (twitter.protected && minutes < 15) {
      return false;
    }

    // Twitter が削除等のエラーが発生している場合、6時間間隔を空ける
    if (_twitterStatus.status !== 'active' && getDiffMinutes(now, _twitterStatus.lastChecked.toDate()) < 60 * 6) {
      return false;
    }

    // Token がない場合、6時間間隔を空ける
    // undefined チェックはあとで削除する
    if (
      _tokenStatus !== undefined &&
      _tokenStatus.status !== 'valid' &&
      getDiffMinutes(now, _twitterStatus.lastChecked.toDate()) < 60
    ) {
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
      const { uid, twitterId, twitterProtected, role, paginationToken, lastSetTwUsers, sharedToken, publishedAt } =
        message.json as Message;
      const now = new Date(context.timestamp);

      // 10秒以内の実行に限る
      if (checkJustPublished(now, publishedAt)) {
        console.error(`❗️Failed to run functions: published more than 10 seconds ago.`);
        return;
      }
      console.log(`⚙️ Starting get followers of [${uid}]. Shared token is ${sharedToken?.id ?? 'not available'}.`);

      const [sharedClient, ownClient] = await getTwitterClientWithIdSetStep(now, uid, sharedToken, twitterProtected);
      await checkOwnUserStatusStep(now, sharedClient, uid, twitterId);
      const { users, nextToken } = await getFollowersIdsStep(
        now,
        ownClient || sharedClient,
        uid,
        twitterId,
        paginationToken
      );
      await saveDocsStep(
        now,
        uid,
        users.map((user) => user.id),
        nextToken,
        [sharedClient, ownClient]
      );
      await saveTwUsersStep(now, uid, new Date(lastSetTwUsers), role, users, nextToken === null);

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

const getTwitterClientWithIdSetStep = async (
  now: Date,
  uid: string,
  sharedToken: Message['sharedToken'],
  twitterProtected: Message['twitterProtected']
): Promise<[TwitterClientWithToken, TwitterClientWithToken | null]> => {
  const shared: TwitterClientWithToken = {
    client: getClient({
      accessToken: sharedToken.accessToken,
      accessSecret: sharedToken.accessTokenSecret,
    }),
    token: sharedToken,
  };

  const exists = await existsUser(sharedToken.id);
  if (exists) {
    await updateTokenStatusOfUser(sharedToken.id, {
      lastChecked: now,
      status: 'valid',
    });
  }

  if (!twitterProtected) {
    return [shared, null];
  }

  const token = await getToken(uid);
  await updateTokenStatusOfUser(uid, {
    lastChecked: now,
    status: token !== null ? 'valid' : 'invalid',
  });

  if (!token) {
    console.error('❗️No token.');
    return [shared, null];
  }

  return [
    shared,
    {
      client: getClient({
        accessToken: token.twitterAccessToken,
        accessSecret: token.twitterAccessTokenSecret,
      }),
      token: {
        id: uid,
        accessToken: token.twitterAccessToken,
        accessTokenSecret: token.twitterAccessTokenSecret,
      },
    },
  ];
};

/**
 * 自身のアカウント状態を確認
 * 削除または凍結されている場合は、処理を中断する
 */
const checkOwnUserStatusStep = async (
  now: Date,
  { client, token }: TwitterClientWithToken,
  uid: string,
  twitterId: string
): Promise<void> => {
  const response = await getUser(client, twitterId);
  if ('error' in response) {
    // 429
    if (response.error.data.title === 'Too Many Requests') {
      await updateLastUsedSharedToken(token.id, ['v2_getUser'], dayjs(now).add(6, 'hours').toDate());
      throw new Error('❗️ Too Many Requests.');
    }

    await publishCheckValiditySharedToken(token);
    throw new Error(`❗️An error occurred while retrieving own status.`);
  }
  if ('errorUser' in response) {
    const status = response.errorUser?.status ?? 'unknown';
    await updateTwiterStatusOfUser(uid, { lastChecked: now, status });
    throw new Error(`❗️Own is deleted or suspended.`);
  }

  const user = response.user;
  if (user) {
    await setUserTwitter(uid, convertTwitterUserToUserTwitter(user), { lastChecked: now, status: 'active' });
  }
};

/**
 * フォロワーIDリストの取得
 */
const getFollowersIdsStep = async (
  now: Date,
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
    // 429
    if (response.error.data.title === 'Too Many Requests') {
      await updateLastUsedSharedToken(token.id, ['v2_getUserFollowers'], dayjs(now).add(6, 'hours').toDate());
      if (token.id === uid) await updateTokenStatusOfUser(uid, { lastChecked: now, status: '429' });
      throw new Error('❗️ Too Many Requests.');
    }

    await publishCheckValiditySharedToken(token);
    const message = `❗️Failed to get users from Twitter of [${uid}].`;
    throw new Error(message);
  }

  console.log(`⏳ Got ${response.users.length} followers from Twitter.`);
  return response;
};

/**
 * 結果をドキュメント保存
 */
const saveDocsStep = async (
  now: Date,
  uid: string,
  followersIds: string[],
  nextToken: string | null,
  [sharedClient, ownClient]: [TwitterClientWithToken, TwitterClientWithToken | null]
): Promise<void> => {
  const ended = nextToken === null;

  const updatingTokens = ownClient
    ? [
        checkExistsSharedToken(ownClient.token.id).then(async () => {
          await updateLastUsedSharedToken(ownClient.token.id, ['v2_getUserFollowers'], now);
        }),
        checkExistsSharedToken(sharedClient.token.id).then(async () => {
          await updateLastUsedSharedToken(sharedClient.token.id, ['v2_getUser'], now);
        }),
      ]
    : [
        checkExistsSharedToken(sharedClient.token.id).then(async () => {
          await updateLastUsedSharedToken(sharedClient.token.id, ['v2_getUserFollowers', 'v2_getUser'], now);
        }),
      ];

  await Promise.all([
    setWatchV2(uid, followersIds, now, ended),
    setUserGetFollowersV2Status(uid, nextToken, ended, now),
    ...updatingTokens,
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
  role: StripeRole,
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
  if (ended) await setUserGetFollowersV2LastSetTwUsers(uid, now);
};
