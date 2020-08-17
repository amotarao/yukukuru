import { getClient, TwitterUser, AccessToken, TwitterApiResponseType } from './client';

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

export type GetFollowersListParams =
  | {
      user_id: string | number;
      cursor?: string | number;
      count?: number;
      skip_status?: boolean;
      include_user_entities?: boolean;
    }
  | {
      screen_name: string;
      cursor?: string | number;
      count?: number;
      skip_status?: boolean;
      include_user_entities?: boolean;
    };

export type GetFollowersListResponse<T extends number | string = number> = {
  users: TwitterUser[];
  next_cursor: number;
  next_cursor_str: string;
  previous_cursor: number;
  previous_cursor_str: string;
};

/**
 * フォロワーの一覧を取得
 *
 * @see https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/follow-search-get-users/api-reference/get-followers-list
 */
export const getFollowersList = async <T extends number | string = number>(
  params: GetFollowersListParams,
  accessToken?: AccessToken
): TwitterApiResponseType<GetFollowersListResponse<T>> => {
  const client = getClient(accessToken);

  return client
    .get('followers/list', params)
    .then((response) => {
      return {
        success: true as const,
        data: response as GetFollowersListResponse<T>,
      };
    })
    .catch((error) => {
      return {
        success: false as const,
        error,
      };
    });
};

export const getFollowersListLoop = async <T extends number | string = number>(
  params: GetFollowersListParams,
  accessToken?: AccessToken
): TwitterApiResponseType<GetFollowersListResponse<T>> => {
  const users: GetFollowersListResponse<T>['users'] = [];
  let resultData: GetFollowersListResponse<T> | null = null;
  let error: any | null = null;

  let cursor: string | number = params.cursor || '-1';
  let loopCount = 0;
  const maxLoopCount = Math.min(Math.ceil((params.count || 200) / 200), 15);

  while (loopCount < maxLoopCount) {
    const result = await getFollowersList<T>({ ...params, cursor, count: 200 }, accessToken);
    if (!result.success) {
      error = result.error;
      break;
    }

    users.push(...result.data.users);
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
        users,
      },
    };
  }

  return {
    success: false,
    error,
  };
};
