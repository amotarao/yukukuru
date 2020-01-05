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
 * フォロワーの IDリストを取得 単体
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
 * フォロワーの IDリストを取得
 * 1回につき 5,000人まで 取得可能
 * 15分につき 15回まで 取得可能
 * @see: https://developer.twitter.com/en/docs/accounts-and-users/follow-search-get-users/api-reference/get-followers-ids
 */
export async function getFollowersIds(accessToken: TwitterAccessToken, props: GetFollowersIdsProps): Promise<TwitterResponse<GetFollowersIdsResponse>> {
  const ids: GetFollowersIdsResponse['ids'] = [];
  let cursor: GetFollowersIdsResponse['next_cursor_str'] = props.cursor;
  let errors: TwitterErrorResponse[] = [];
  let loop = 15;

  while (loop > 0) {
    const { response, errors: currentErrors } = await getFollowersIdsSingle(accessToken, { ...props, cursor, count: 5000 });
    if (response === null) {
      errors = [...currentErrors];
      break;
    }

    ids.push(...response.ids);
    cursor = response.next_cursor_str;

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
