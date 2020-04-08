import * as Twitter from 'twitter';
import { twitterClientErrorHandler, TwitterClientErrorData, checkRateLimitExceeded } from './error';
import { TwitterUserInterface } from '.';

export interface GetFollowersListProps {
  userId: string;
  cursor?: string;
  count?: number;
}

export interface GetFollowersListResponse {
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
): Promise<{ response: GetFollowersListResponse } | { errors: TwitterClientErrorData[] }> => {
  return client
    .get('followers/list', {
      user_id: userId,
      cursor,
      count,
      skip_status: true,
      include_user_entities: false,
    })
    .then((response) => {
      return { response: response as GetFollowersListResponse };
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
): Promise<{ response: GetFollowersListResponse } | { errors: TwitterClientErrorData[] }> => {
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
        console.error({ summary: 'rateLimitExceeded', userId, count });
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

  const response: GetFollowersListResponse = {
    users,
    next_cursor_str: nextCursor,
  };

  return { response };
};
