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

export type GetUsersLookupParams =
  | {
      user_id: string;
      include_entities?: boolean;
      tweet_mode?: boolean;
    }
  | {
      screen_name: string;
      include_entities?: boolean;
      tweet_mode?: boolean;
    };

export type GetUsersLookupResponse = TwitterUser[];

/**
 * ユーザー情報を取得
 *
 * @see https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/follow-search-get-users/api-reference/get-users-lookup
 */
export const getUsersLookup = async (
  params: GetUsersLookupParams,
  accessToken?: AccessToken
): TwitterApiResponseType<GetUsersLookupResponse> => {
  const client = getClient(accessToken);

  return client
    .get('users/lookup', params)
    .then((response) => {
      return {
        success: true as const,
        data: response as GetUsersLookupResponse,
      };
    })
    .catch((error) => {
      return {
        success: false as const,
        error,
      };
    });
};

export const getUsersLookupLoop = async (
  params: GetUsersLookupParams,
  accessToken?: AccessToken
): TwitterApiResponseType<GetUsersLookupResponse> => {
  const type = 'user_id' in params ? 'user_id' : 'screen_name';
  const targets = 'user_id' in params ? params.user_id.split(',') : params.screen_name.split(',');

  const users: GetUsersLookupResponse = [];
  let resultData: null | true = null;
  let error: any | null = null;

  let loopCount = 0;
  const maxLoopCount = 100; // user: 900 / app: 300

  while (loopCount < maxLoopCount) {
    const currentTargets = targets.slice(loopCount * 100, (loopCount + 1) * 100).join(',');
    const result = await getUsersLookup({ ...params, [type]: currentTargets }, accessToken);
    if (!result.success) {
      error = result.error;
      break;
    }

    users.push(...result.data);
    resultData = true;
    loopCount++;
  }

  if (resultData) {
    return {
      success: true,
      data: users,
    };
  }

  return {
    success: false,
    error,
  };
};
