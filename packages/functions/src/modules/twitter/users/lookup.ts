import * as _ from 'lodash';
import { ApiResponseError, TwitterApiReadOnly, UserV2 } from 'twitter-api-v2';
import { userFields } from '../constants';
import { convertErrorUsers, toRequiredTwitterUser } from '../converter';
import { twitterClientErrorHandler } from '../error';
import { TwitterErrorUser, TwitterUser } from '../types';

/**
 * ユーザー情報を取得
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
 * ユーザー情報を取得
 */
export const getUsers = async (
  client: TwitterApiReadOnly,
  ids: string[]
): Promise<{ users: TwitterUser[]; errorUsers: TwitterErrorUser[] } | { error: ApiResponseError }> => {
  const lookup = _.chunk(_.uniq(ids), 100).map(
    async (
      usersId
    ): Promise<
      | {
          users: TwitterUser[];
          errorUsers: TwitterErrorUser[];
          error: null;
        }
      | {
          users: null;
          errorUsers: null;
          error: ApiResponseError;
        }
    > => {
      const result = await getUsersSingle(client, usersId);

      if ('error' in result) {
        return { users: null, errorUsers: null, error: result.error };
      }
      return { users: result.users, errorUsers: result.errorUsers, error: null };
    }
  );
  const lookuped = await Promise.all(lookup);

  const users: TwitterUser[] = [];
  const errorUsers: TwitterErrorUser[] = [];
  const errors: ApiResponseError[] = [];

  for (const single of lookuped) {
    if (single.users) {
      users.push(...single.users);
      errorUsers.push(...single.errorUsers);
      continue;
    }

    errors.push(single.error);
    break;
  }

  if (users.length > 0 || errorUsers.length > 0 || errors.length === 0) {
    return {
      users,
      errorUsers,
    };
  }

  return {
    error: errors[0],
  };
};
