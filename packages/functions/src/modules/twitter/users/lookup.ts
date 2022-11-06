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
 * 15分につき 300回 実行可能
 */
const getUsersLookupSingle = async (
  client: TwitterApiReadOnly,
  { usersId }: TwitterGetUsersLookupParameters
): Promise<
  | { response: Pick<UserV2, 'id' | 'username' | 'name' | 'profile_image_url' | 'public_metrics' | 'verified'>[] }
  | { error: ApiResponseError }
> => {
  const response = await client.v2
    .users(usersId, {
      'user.fields': ['id', 'username', 'name', 'profile_image_url', 'public_metrics', 'verified'],
    })
    .catch(twitterClientErrorHandler);

  if ('error' in response) {
    return response;
  }

  return {
    response: response.data,
  };
};

/**
 * ユーザー情報を取得
 * 15分につき 30,000人まで 取得可能
 */
export const getUsersLookup = async (
  client: TwitterApiReadOnly,
  { usersId }: TwitterGetUsersLookupParameters
): Promise<{ response: TwitterUser[] } | { error: ApiResponseError }> => {
  const lookup = _.chunk(_.uniq(usersId), 100).map(
    async (usersId): Promise<[TwitterUser[], null] | [null, ApiResponseError]> => {
      const result = await getUsersLookupSingle(client, { usersId });

      if ('error' in result) {
        return [null, result.error];
      }

      const users = result.response.map((res) => {
        const { id, username, name, profile_image_url, public_metrics, verified } = res;
        const user: TwitterUser = {
          id_str: id,
          screen_name: username,
          name,
          profile_image_url_https: profile_image_url || '',
          followers_count: public_metrics?.followers_count || 0,
          verified: verified || false,
        };
        return user;
      });
      return [users, null];
    }
  );
  const lookuped = await Promise.all(lookup);

  const users: TwitterUser[] = [];
  const errors: ApiResponseError[] = [];

  for (const single of lookuped) {
    if (single[0]) {
      users.push(...single[0]);
      continue;
    }

    errors.push(single[1]);
    break;
  }

  if (users.length > 0) {
    return {
      response: users,
    };
  }

  if (errors.length === 0) {
    return {
      response: [],
    };
  }

  return {
    error: errors[0],
  };
};
