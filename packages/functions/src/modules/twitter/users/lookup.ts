import * as _ from 'lodash';
import { ApiResponseError, TwitterApiReadOnly } from 'twitter-api-v2';
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
const getUsersLookupSingle = (
  client: TwitterApiReadOnly,
  { usersId }: TwitterGetUsersLookupParameters
): Promise<{ response: TwitterUser[] } | { error: ApiResponseError }> => {
  return client.v2
    .users(usersId, {
      'user.fields': ['id', 'username', 'name', 'profile_image_url', 'public_metrics', 'verified'],
    })
    .then((response) => ({
      response: response.data.map(
        (user): TwitterUser => ({
          id_str: user.id,
          screen_name: user.username,
          name: user.name,
          profile_image_url_https: user.profile_image_url || '',
          followers_count: user.public_metrics?.followers_count || 0,
          verified: user.verified || false,
        })
      ),
    }))
    .catch(twitterClientErrorHandler);
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

      return [result.response, null];
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
