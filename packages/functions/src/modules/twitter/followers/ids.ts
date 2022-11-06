import { ApiResponseError, TwitterApiReadOnly } from 'twitter-api-v2';
import { twitterClientErrorHandler } from '../error';

export type TwitterGetFollowersIdsParameters = {
  userId: string;
  cursor?: string;
  count?: number;
};

export type TwitterGetFollowersIdsResponse = {
  ids: string[];
  next_cursor: number;
  next_cursor_str: string;
  previous_cursor: number;
  previous_cursor_str: string;
};

type PickedTwitterGetFollowersIdsResponse = Pick<TwitterGetFollowersIdsResponse, 'ids' | 'next_cursor_str'>;

/**
 * 指定したユーザーのフォロワーの IDリストを取得
 * 5,000人まで 取得可能
 * 15分につき 15回実行可能
 *
 * @see https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/follow-search-get-users/api-reference/get-followers-ids
 */
const getFollowersIdsSingle = (
  client: TwitterApiReadOnly,
  { userId, cursor = '-1', count = 5000 }: TwitterGetFollowersIdsParameters
): Promise<{ response: PickedTwitterGetFollowersIdsResponse } | { error: ApiResponseError }> => {
  return client
    .get('followers/ids', {
      user_id: userId,
      cursor,
      count,
      stringify_ids: true,
    })
    .then((res) => {
      const { ids, next_cursor_str } = res;
      const response: PickedTwitterGetFollowersIdsResponse = { ids, next_cursor_str };
      return { response };
    })
    .catch(twitterClientErrorHandler);
};

/**
 * 指定したユーザーのフォロワーの IDリストを取得
 * 15分につき 最大75,000人まで 取得可能
 *
 * count は 5000 の倍数で入力
 *
 * @param client Twitter Client
 * @param param パラメータ
 */
export const getFollowersIds = async (
  client: TwitterApiReadOnly,
  { userId, cursor = '-1', count = 75000 }: TwitterGetFollowersIdsParameters
): Promise<{ response: PickedTwitterGetFollowersIdsResponse } | { error: ApiResponseError }> => {
  const ids: string[] = [];
  let nextCursor = cursor;

  let getCount = 0;
  const maxGetCount = Math.min(Math.floor(count / 5000), 15);

  while (getCount < maxGetCount) {
    const obj: TwitterGetFollowersIdsParameters = {
      userId,
      cursor: nextCursor,
    };
    const result = await getFollowersIdsSingle(client, obj);

    // エラーが発生した場合
    if ('error' in result) {
      // 1回でも取得が完了している場合は、すでに取得されているデータを返すため、繰り返し処理を終了する
      if (getCount > 0) {
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

  const response: PickedTwitterGetFollowersIdsResponse = {
    ids,
    next_cursor_str: nextCursor,
  };

  return { response };
};
