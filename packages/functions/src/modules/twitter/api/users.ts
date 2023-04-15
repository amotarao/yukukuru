import { chunk, uniq } from 'lodash';
import { ApiResponseError, TwitterApiReadOnly, UserV2 } from 'twitter-api-v2';
import { userFields } from '../constants';
import { convertErrorUsers, toRequiredTwitterUser } from '../converter';
import { twitterClientErrorHandler } from '../error';
import { TwitterErrorUser, TwitterUser } from '../types';

/**
 * 複数アカウントのユーザー情報を取得
 *
 * 1回 100人まで 取得可能
 * 15分につき 900回 実行可能
 *
 * @see https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users
 */
const getUsersSingle = async (
  client: TwitterApiReadOnly,
  ids: string[]
): Promise<{ users: TwitterUser[]; errorUsers: TwitterErrorUser[] } | { error: ApiResponseError }> => {
  return client.v2
    .users(ids, { ...userFields })
    .then((response) => {
      // リクエストした全アカウントが存在しない場合、data フィールドが存在しない
      // パッケージで対応していないので、キャストしている
      const data = response.data as UserV2[] | undefined;
      return {
        users: data?.map(toRequiredTwitterUser) ?? [],
        errorUsers: convertErrorUsers(response.errors),
      };
    })
    .catch(twitterClientErrorHandler);
};

/**
 * 複数アカウントのユーザー情報を取得
 */
export const getUsers = async (
  client: TwitterApiReadOnly,
  ids: string[]
): Promise<{ users: TwitterUser[]; errorUsers: TwitterErrorUser[] } | { error: ApiResponseError }> => {
  const chunkedIdsList = chunk(uniq(ids), 100);
  const responseList = await Promise.all(chunkedIdsList.map((chunkedIds) => getUsersSingle(client, chunkedIds)));

  const users: TwitterUser[] = [];
  const errorUsers: TwitterErrorUser[] = [];
  const errors: ApiResponseError[] = [];

  responseList.forEach((response) => {
    if ('error' in response) {
      errors.push(response.error);
      return;
    }
    users.push(...response.users);
    errorUsers.push(...response.errorUsers);
  });

  // データがあればそのまま返す
  if (users.length > 0 || errorUsers.length > 0) {
    return { users, errorUsers };
  }
  // データが0件でもエラーがなければ空配列を返す
  if (!errors[0]) {
    return { users, errorUsers };
  }
  // データが0件かつエラーがあるので、最初のエラーを返す
  return { error: errors[0] };
};

/**
 * ユーザー情報を取得
 *
 * 15分につき 900回 実行可能
 *
 * @see https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-id
 */
export const getUser = async (
  client: TwitterApiReadOnly,
  id: string
): Promise<{ user: TwitterUser } | { errorUser: boolean } | { error: ApiResponseError }> => {
  return client.v2
    .user(id, { ...userFields })
    .then((response) => {
      const data = response.data as UserV2 | undefined;

      if (data) {
        return {
          user: toRequiredTwitterUser(data),
        };
      }

      return {
        errorUser: true,
      };
    })
    .catch(twitterClientErrorHandler);
};
