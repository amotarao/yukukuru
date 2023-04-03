import * as _ from 'lodash';
import { ApiResponseError, InlineErrorV2, TwitterApiReadOnly, UserV2 } from 'twitter-api-v2';
import { TwitterUser } from '..';
import { toRequiredTwitterUser } from '../../twitter-user-converter';
import { twitterClientErrorHandler } from '../error';

export type TwitterGetUsersLookupParameters = {
  usersId: string[];
};

/**
 * ユーザー情報を取得
 * 100人まで 取得可能
 * 15分につき 900回 実行可能
 */
const getUsersLookupSingle = async (
  client: TwitterApiReadOnly,
  { usersId }: TwitterGetUsersLookupParameters
): Promise<{ response: { users: TwitterUser[]; errorUsers: InlineErrorV2[] } } | { error: ApiResponseError }> => {
  return client.v2
    .users(usersId, {
      'user.fields': ['id', 'username', 'name', 'profile_image_url', 'public_metrics', 'verified'],
    })
    .then((response) => {
      // リクエストした全アカウントが存在しない場合、data フィールドが存在しない
      // パッケージで対応していないので、キャストしている
      const data = response.data as UserV2[] | undefined;

      return {
        response: {
          users: data?.map(toRequiredTwitterUser) ?? [],
          errorUsers: response.errors ?? [],
        },
      };
    })
    .catch(twitterClientErrorHandler);
};

/**
 * ユーザー情報を取得
 * 15分につき 90,000人まで 取得可能
 */
export const getUsersLookup = async (
  client: TwitterApiReadOnly,
  { usersId }: TwitterGetUsersLookupParameters
): Promise<{ response: { users: TwitterUser[]; errorUsers: InlineErrorV2[] } } | { error: ApiResponseError }> => {
  const lookup = _.chunk(_.uniq(usersId), 100).map(
    async (
      usersId
    ): Promise<
      | {
          users: TwitterUser[];
          errorUsers: InlineErrorV2[];
          error: null;
        }
      | {
          users: null;
          errorUsers: null;
          error: ApiResponseError;
        }
    > => {
      const result = await getUsersLookupSingle(client, { usersId });

      if ('error' in result) {
        return { users: null, errorUsers: null, error: result.error };
      }
      return { users: result.response.users, errorUsers: result.response.errorUsers, error: null };
    }
  );
  const lookuped = await Promise.all(lookup);

  const users: TwitterUser[] = [];
  const errorUsers: InlineErrorV2[] = [];
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
      response: {
        users,
        errorUsers,
      },
    };
  }

  return {
    error: errors[0],
  };
};
