import * as _ from 'lodash';
import * as Twitter from 'twitter';
import { TwitterClientErrorData, twitterClientErrorHandler, checkRateLimitExceeded } from '../modules/twitter/error';
import { errorLog } from './log';

export interface TwitterUserInterface {
  id_str: string;
  screen_name: string;
  name: string;
  profile_image_url_https: string;
}

export interface GetFollowersListProps {
  userId: string;
  cursor?: string;
  count?: number;
}

export interface GetFollowersListResponseData {
  users: TwitterUserInterface[];
  next_cursor_str: string;
}

/**
 * userId のフォロワーリストを取得
 * 200人まで 取得可能
 * 15分につき 15回取得可能
 */
export const getFollowersListSingle = (
  client: Twitter,
  { userId, cursor = '-1', count = 200 }: GetFollowersListProps
): Promise<{ response: GetFollowersListResponseData } | { errors: TwitterClientErrorData[] }> => {
  return client
    .get('followers/list', {
      user_id: userId,
      cursor,
      count,
      skip_status: true,
      include_user_entities: false,
    })
    .then((response) => {
      return { response: response as GetFollowersListResponseData };
    })
    .catch(twitterClientErrorHandler);
};

/**
 * userId のフォロワーリストを取得
 * 15分につき 3,000人まで 取得可能
 */
export const getFollowersList = async (
  client: Twitter,
  { userId, cursor = '-1' }: GetFollowersListProps
): Promise<{ response: GetFollowersListResponseData } | { errors: TwitterClientErrorData[] }> => {
  const users: TwitterUserInterface[] = [];
  let nextCursor = cursor;
  let count = 0;

  while (count < 15) {
    const obj: GetFollowersListProps = {
      userId,
      cursor: nextCursor,
    };
    const result = await getFollowersListSingle(client, obj);
    if ('errors' in result) {
      if (checkRateLimitExceeded(result.errors)) {
        errorLog('twitter', 'getFollowersList', { summary: 'rateLimitExceeded', userId, count });
        break;
      }
      return result;
    }
    users.push(...result.response.users);
    nextCursor = result.response.next_cursor_str;
    if (result.response.next_cursor_str === '0') {
      break;
    }
    count++;
  }

  const response: GetFollowersListResponseData = {
    users,
    next_cursor_str: nextCursor,
  };

  return { response };
};

export interface GetFollowersIdListProps {
  userId: string;
  cursor?: string;
  count?: number;
}

export interface GetFollowersIdListResponseData {
  ids: string[];
  next_cursor_str: string;
}

/**
 * userId のフォロワーの IDリストを取得
 * 5,000人まで 取得可能
 * 15分につき 15回取得可能
 */
export const getFollowersIdListSingle = (
  client: Twitter,
  { userId, cursor = '-1', count = 5000 }: GetFollowersIdListProps
): Promise<{ response: GetFollowersIdListResponseData } | { errors: TwitterClientErrorData[] }> => {
  return client
    .get('followers/ids', {
      user_id: userId,
      cursor,
      count,
      stringify_ids: true,
    })
    .then((response) => {
      return { response: response as GetFollowersIdListResponseData };
    })
    .catch(twitterClientErrorHandler);
};

/**
 * userId のフォロワーの IDリストを取得
 * 15分につき 75,000人まで 取得可能
 */
export const getFollowersIdList = async (
  client: Twitter,
  { userId, cursor = '-1', count = 75000 }: GetFollowersIdListProps
): Promise<{ response: GetFollowersIdListResponseData } | { errors: TwitterClientErrorData[] }> => {
  const ids: string[] = [];
  let nextCursor = cursor;
  let getCount = 0;
  const maxGetCount = Math.min(Math.floor(count / 5000), 15);

  while (getCount < maxGetCount) {
    const obj: GetFollowersIdListProps = {
      userId,
      cursor: nextCursor,
    };
    const result = await getFollowersIdListSingle(client, obj);
    if ('errors' in result) {
      if (checkRateLimitExceeded(result.errors)) {
        errorLog('twitter', 'getFollowersIdList', { summary: 'rateLimitExceeded', userId, count: getCount });
        break;
      }
      return result;
    }
    ids.push(...result.response.ids);
    nextCursor = result.response.next_cursor_str;
    if (result.response.next_cursor_str === '0') {
      break;
    }
    getCount++;
  }

  const response: GetFollowersIdListResponseData = {
    ids,
    next_cursor_str: nextCursor,
  };

  return { response };
};

export interface GetUsersLookupProps {
  usersId: string[];
}

/**
 * ユーザー情報を取得
 * 100人まで 取得可能
 * 15分につき 300回 実行可能
 */
export const getUsersLookupSingle = (
  client: Twitter,
  { usersId }: GetUsersLookupProps
): Promise<{ response: TwitterUserInterface[] } | { errors: TwitterClientErrorData[] }> => {
  return client
    .get('users/lookup', {
      user_id: usersId.join(','),
    })
    .then((response) => {
      return { response: response as TwitterUserInterface[] };
    })
    .catch(twitterClientErrorHandler);
};

/**
 * ユーザー情報を取得
 * 15分につき 30,000人まで 取得可能
 */
export const getUsersLookup = async (
  client: Twitter,
  { usersId }: GetUsersLookupProps
): Promise<{ response: TwitterUserInterface[] } | { errors: TwitterClientErrorData[] }> => {
  const users: TwitterUserInterface[] = [];
  const errors: TwitterClientErrorData[] = [];

  const lookup = _.chunk(_.uniq(usersId), 100).map(async (usersId) => {
    const result = await getUsersLookupSingle(client, { usersId });

    if ('errors' in result) {
      errors.push(...result.errors);
      return;
    }

    result.response.forEach(({ id_str, screen_name, name, profile_image_url_https }) => {
      const data: TwitterUserInterface = {
        id_str,
        screen_name,
        name,
        profile_image_url_https,
      };
      users.push(data);
    });
    return;
  });

  await Promise.all(lookup);

  if (users.length || !errors.length) {
    return { response: users };
  }

  return { errors };
};
