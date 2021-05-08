import * as Twitter from 'twitter';
import { TwitterClientErrorData, twitterClientErrorHandler } from '../error';

export type GetFollowersIdListProps = {
  userId: string;
  cursor?: string;
  count?: number;
};

export type GetFollowersIdListResponseData = {
  ids: string[];
  next_cursor_str: string;
};

/**
 * userId のフォロワーの IDリストを取得
 * 5,000人まで 取得可能
 * 15分につき 15回取得可能
 *
 * @see https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/follow-search-get-users/api-reference/get-followers-ids
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

    // エラーが発生した場合
    if ('errors' in result) {
      // 1回でも取得が完了している場合は、すでに取得されているデータを返すため、繰り返し処理を終了する
      if (ids.length) {
        break;
      }

      // 1回目でのエラーの場合は、エラーのみを返す
      return result;
    }

    ids.push(...result.response.ids);
    nextCursor = result.response.next_cursor_str;

    // カーソルが 0 になった場合は、最終地点のため、繰り返し処理を終了する
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
