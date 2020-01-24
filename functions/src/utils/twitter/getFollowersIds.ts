import { getClient, TwitterAccessToken } from './client';
import { TwitterErrorResponse } from './error';
import { TwitterResponse } from './response';

interface GetFollowersIdsProps {
  userId: string;
  cursor: string;
  count?: number;
}

interface GetFollowersIdsResponse {
  ids: string[];
  next_cursor_str: string;
}

/**
 * 対象ユーザーのフォロワーのIDリストを取得
 * 1回のリクエスト
 */
async function getFollowersIdsSingle(
  accessToken: TwitterAccessToken | null,
  { userId, cursor, count = 5000 }: GetFollowersIdsProps
): Promise<TwitterResponse<GetFollowersIdsResponse | null>> {
  const client = getClient(accessToken);
  const params = {
    user_id: userId,
    cursor: cursor || '-1',
    count,
    stringify_ids: true,
  };

  try {
    const response = (await client.get('followers/ids', params)) as GetFollowersIdsResponse;
    return {
      response,
      errors: [],
    };
  } catch (errors) {
    return {
      response: null,
      errors: errors as TwitterErrorResponse[],
    };
  }
}

/**
 * 対象ユーザーのフォロワーのIDリストを取得
 * IDリストと次回リクエスト時のカーソルを返す
 *
 * 1回につき 5,000人まで 取得可能
 * 15分につき 15回まで 取得可能
 * @see: https://developer.twitter.com/en/docs/accounts-and-users/follow-search-get-users/api-reference/get-followers-ids
 */
export async function getFollowersIds(
  accessToken: TwitterAccessToken,
  props: GetFollowersIdsProps
): Promise<TwitterResponse<GetFollowersIdsResponse>> {
  /** IDリストを格納 */
  const ids: GetFollowersIdsResponse['ids'] = [];
  /** 現在のカーソルを格納 */
  let cursor: GetFollowersIdsResponse['next_cursor_str'] = props.cursor;
  /** エラーを格納 */
  const errors: TwitterErrorResponse[] = [];
  /** ループ回数を格納 */
  let loop = 15;

  while (loop > 0) {
    const params = {
      ...props,
      cursor,
      count: 5000,
    };
    const { response, errors: currentErrors } = await getFollowersIdsSingle(accessToken, params);

    // エラーが出たら終了、エラーをセット
    if (response === null) {
      errors.push(...currentErrors);
      break;
    }

    ids.push(...response.ids);
    cursor = response.next_cursor_str;

    // -1, 0 の際は最後まで取得が完了しているので終了
    if (cursor === '-1' || cursor === '0') {
      break;
    }
    loop--;
  }

  const response: GetFollowersIdsResponse = {
    ids,
    next_cursor_str: cursor,
  };

  return {
    response,
    errors,
  };
}
