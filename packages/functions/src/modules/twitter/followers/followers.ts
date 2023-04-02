import { ApiResponseError, TwitterApiReadOnly } from 'twitter-api-v2';
import { TwitterUser } from '..';
import { toRequiredTwitterUser } from '../../twitter-user-converter';
import { twitterClientErrorHandler } from '../error';

export const getFollowersMaxResultsMax = 1000;

export type TwitterGetFollowersParameters = {
  userId: string;
  maxResults?: number;
  paginationToken?: string | null;
};

export type TwitterGetFollowersResponse = {
  users: TwitterUser[];
  nextToken: string | null;
};

/**
 * @see https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/get-users-id-followers
 */
export const getFollowersSingle = async (
  client: TwitterApiReadOnly,
  { userId, maxResults = getFollowersMaxResultsMax, paginationToken = null }: TwitterGetFollowersParameters
): Promise<{ response: TwitterGetFollowersResponse } | { error: ApiResponseError }> => {
  return client.v2
    .followers(userId, {
      'user.fields': ['id', 'username', 'name', 'profile_image_url', 'public_metrics', 'verified'],
      max_results: maxResults,
      pagination_token: paginationToken || undefined,
    })
    .then((res) => {
      const response: TwitterGetFollowersResponse = {
        users: res.data.map(toRequiredTwitterUser),
        nextToken: res.meta.next_token || null,
      };
      return { response };
    })
    .catch(twitterClientErrorHandler);
};

export const getFollowers = async (
  client: TwitterApiReadOnly,
  { userId, maxResults = getFollowersMaxResultsMax * 15, paginationToken = null }: TwitterGetFollowersParameters
): Promise<{ response: TwitterGetFollowersResponse } | { error: ApiResponseError }> => {
  const users: TwitterGetFollowersResponse['users'] = [];
  let nextToken = paginationToken;

  let getCount = 0;
  const maxGetCount = Math.min(Math.floor(maxResults / getFollowersMaxResultsMax), 15);

  while (getCount < maxGetCount) {
    const obj: TwitterGetFollowersParameters = {
      userId,
      paginationToken: nextToken,
    };
    const result = await getFollowersSingle(client, obj);

    // エラーが発生した場合
    if ('error' in result) {
      // 1回でも取得が完了している場合は、すでに取得されているデータを返すため、繰り返し処理を終了する
      if (getCount > 0) {
        break;
      }

      // 1回目でのエラーの場合は、エラーのみを返す
      return result;
    }

    users.push(...result.response.users);
    nextToken = result.response.nextToken;

    // nextToken が null になった場合は、最終地点のため、繰り返し処理を終了する
    if (result.response.nextToken === null) {
      break;
    }

    getCount++;
  }

  const response: TwitterGetFollowersResponse = {
    users,
    nextToken: nextToken,
  };

  return { response };
};
