import { getClient, AccessToken, TwitterApiResponseType } from './client';

export type GetFollowersIdsParams =
  | {
      user_id: string | number;
      cursor?: string | number;
      stringify_ids?: boolean;
      count?: number;
    }
  | {
      screen_name: string;
      cursor?: string | number;
      stringify_ids?: boolean;
      count?: number;
    };

export type GetFollowersIdsResponse<T extends number | string = number> = {
  ids: T[];
  next_cursor: number;
  next_cursor_str: string;
  previous_cursor: number;
  previous_cursor_str: string;
};

/**
 * フォロワーのIDリストを取得
 *
 * @see https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/follow-search-get-users/api-reference/get-followers-ids
 */
export const getFollowersIds = async <T extends number | string = number>(
  params: GetFollowersIdsParams,
  accessToken?: AccessToken
): TwitterApiResponseType<GetFollowersIdsResponse<T>> => {
  const client = getClient(accessToken);

  return client
    .get('followers/ids', params)
    .then((response) => {
      return {
        success: true as const,
        data: response as GetFollowersIdsResponse<T>,
      };
    })
    .catch((error) => {
      return {
        success: false as const,
        error,
      };
    });
};

export const getFollowersIdsLoop = async <T extends number | string = number>(
  params: GetFollowersIdsParams,
  accessToken?: AccessToken
): TwitterApiResponseType<GetFollowersIdsResponse<T>> => {
  const ids: GetFollowersIdsResponse<T>['ids'] = [];
  let resultData: GetFollowersIdsResponse<T> | null = null;
  let error: any | null = null;

  let cursor: string | number = params.cursor || '-1';
  let loopCount = 0;
  const maxLoopCount = Math.min(Math.ceil((params.count || 5000) / 5000), 15);

  while (loopCount < maxLoopCount) {
    const result = await getFollowersIds<T>({ ...params, cursor, count: 5000 }, accessToken);
    if (!result.success) {
      error = result.error;
      break;
    }

    ids.push(...result.data.ids);
    resultData = result.data;
    cursor = result.data.next_cursor_str;
    loopCount++;

    if (cursor === '0') {
      break;
    }
  }

  if (resultData) {
    return {
      success: true,
      data: {
        ...resultData,
        ids,
      },
    };
  }

  return {
    success: false,
    error,
  };
};
