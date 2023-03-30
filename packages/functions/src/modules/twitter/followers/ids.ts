import { ApiResponseError, TwitterApiReadOnly, UserFollowerIdsV1Paginator } from 'twitter-api-v2';
import { twitterClientErrorHandler } from '../error';

export type TwitterGetFollowersIdsLegacyParameters = {
  userId: string;
  cursor?: string;
  count?: number;
};

export type TwitterGetFollowersIdsLegacyResponse = Required<
  Pick<UserFollowerIdsV1Paginator['data'], 'ids' | 'next_cursor_str'>
>;

/**
 * 指定したユーザーのフォロワーの IDリストを取得
 * 5,000人まで 取得可能
 * 15分につき 15回実行可能
 *
 * @see https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/follow-search-get-users/api-reference/get-followers-ids
 *
 * @deprecated 廃止予定の Twitter API v1.1 ベースの関数
 */
export const getFollowersIdsSingleLegacy = async (
  client: TwitterApiReadOnly,
  { userId, cursor = '-1', count = 5000 }: TwitterGetFollowersIdsLegacyParameters
): Promise<{ response: TwitterGetFollowersIdsLegacyResponse } | { error: ApiResponseError }> => {
  return client.v1
    .userFollowerIds({
      user_id: userId,
      cursor,
      count,
      stringify_ids: true,
    })
    .then((res) => {
      const { ids, next_cursor_str } = res.data;
      const response: TwitterGetFollowersIdsLegacyResponse = { ids, next_cursor_str: next_cursor_str || '0' };
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
 *
 * @deprecated 廃止予定の Twitter API v1.1 ベースの関数
 */
export const getFollowersIdsLegacy = async (
  client: TwitterApiReadOnly,
  { userId, cursor = '-1', count = 75000 }: TwitterGetFollowersIdsLegacyParameters
): Promise<{ response: TwitterGetFollowersIdsLegacyResponse } | { error: ApiResponseError }> => {
  const ids: string[] = [];
  let nextCursor = cursor;

  let getCount = 0;
  const maxGetCount = Math.min(Math.floor(count / 5000), 15);

  while (getCount < maxGetCount) {
    const obj: TwitterGetFollowersIdsLegacyParameters = {
      userId,
      cursor: nextCursor,
    };
    const result = await getFollowersIdsSingleLegacy(client, obj);

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
    nextCursor = result.response.next_cursor_str || '0';

    // カーソルが 0 になった場合は、最終地点のため、繰り返し処理を終了する
    if (result.response.next_cursor_str === '0') {
      break;
    }

    getCount++;
  }

  const response: TwitterGetFollowersIdsLegacyResponse = {
    ids,
    next_cursor_str: nextCursor,
  };

  return { response };
};
