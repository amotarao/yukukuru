import * as _ from 'lodash';
import { ApiResponseError, TwitterApiReadOnly, UserV2 } from 'twitter-api-v2';
import { TwitterUser } from '..';
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
): Promise<{ response: { users: TwitterUser[]; errorIds: string[] } } | { error: ApiResponseError }> => {
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
          users:
            data?.map(
              ({ id, username, name, profile_image_url, public_metrics, verified }): TwitterUser => ({
                id,
                username,
                name,
                profile_image_url: profile_image_url || '',
                public_metrics: public_metrics || {
                  followers_count: 0,
                  following_count: 0,
                  tweet_count: 0,
                  listed_count: 0,
                },
                verified: verified || false,
              })
            ) ?? [],
          errorIds:
            response.errors
              ?.map((error) => error.value)
              .filter((value): value is string => typeof value === 'string') ?? [],
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
): Promise<{ response: { users: TwitterUser[]; errorIds: string[] } } | { error: ApiResponseError }> => {
  const lookup = _.chunk(_.uniq(usersId), 100).map(
    async (
      usersId
    ): Promise<
      | {
          users: TwitterUser[];
          errorIds: string[];
          error: null;
        }
      | {
          users: null;
          errorIds: null;
          error: ApiResponseError;
        }
    > => {
      const result = await getUsersLookupSingle(client, { usersId });

      if ('error' in result) {
        return { users: null, errorIds: null, error: result.error };
      }
      return { users: result.response.users, errorIds: result.response.errorIds, error: null };
    }
  );
  const lookuped = await Promise.all(lookup);

  const users: TwitterUser[] = [];
  const errorIds: string[] = [];
  const errors: ApiResponseError[] = [];

  for (const single of lookuped) {
    if (single.users) {
      users.push(...single.users);
      errorIds.push(...single.errorIds);
      continue;
    }

    errors.push(single.error);
    break;
  }

  if (users.length > 0 || errorIds.length > 0 || errors.length === 0) {
    return {
      response: {
        users,
        errorIds,
      },
    };
  }

  return {
    error: errors[0],
  };
};
