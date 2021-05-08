import * as Twitter from 'twitter';
import { errorLog } from '../../../utils/log';
import { TwitterClientErrorData, twitterClientErrorHandler, checkRateLimitExceeded } from '../error';

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
