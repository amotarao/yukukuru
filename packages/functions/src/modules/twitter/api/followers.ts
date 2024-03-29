import { ApiResponseError, TwitterApiReadOnly } from 'twitter-api-v2';
import { userFields } from '../constants';
import { toRequiredTwitterUser } from '../converter';
import { twitterClientErrorHandler } from '../error';
import { TwitterUser } from '../types';

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
): Promise<TwitterGetFollowersResponse | { error: ApiResponseError } | { authorizationError: boolean }> => {
  return client.v2
    .followers(userId, { ...userFields, max_results: maxResults, pagination_token: paginationToken || undefined })
    .then((res) => {
      if (
        res.errors?.find((error) => error.type === 'https://api.twitter.com/2/problems/not-authorized-for-resource')
      ) {
        return { authorizationError: true };
      }

      const response: TwitterGetFollowersResponse = {
        users: res.data?.map(toRequiredTwitterUser) ?? [],
        nextToken: res.meta.next_token || null,
      };
      return response;
    })
    .catch(twitterClientErrorHandler);
};

export const getFollowers = async (
  client: TwitterApiReadOnly,
  { userId, maxResults = getFollowersMaxResultsMax * 15, paginationToken = null }: TwitterGetFollowersParameters
): Promise<TwitterGetFollowersResponse | { error: ApiResponseError } | { authorizationError: boolean }> => {
  const users: TwitterGetFollowersResponse['users'] = [];
  let nextToken = paginationToken;

  let getCount = 0;
  const maxGetCount = Math.min(Math.floor(maxResults / getFollowersMaxResultsMax), 15);

  while (getCount < maxGetCount) {
    const obj: TwitterGetFollowersParameters = {
      userId,
      paginationToken: nextToken,
    };
    const response = await getFollowersSingle(client, obj);

    // エラーが発生した場合
    if ('error' in response) {
      // 1回でも取得が完了している場合は、すでに取得されているデータを返すため、繰り返し処理を終了する
      if (getCount > 0) {
        break;
      }

      // 1回目でのエラーの場合は、エラーのみを返す
      return response;
    }

    // 認証エラーが発生した場合
    if ('authorizationError' in response) {
      return response;
    }

    users.push(...response.users);
    nextToken = response.nextToken;

    // nextToken が null になった場合は、最終地点のため、繰り返し処理を終了する
    if (response.nextToken === null) {
      break;
    }

    getCount++;
  }

  const response: TwitterGetFollowersResponse = {
    users,
    nextToken: nextToken,
  };

  return response;
};
