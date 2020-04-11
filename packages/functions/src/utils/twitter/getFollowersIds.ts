import * as Twitter from 'twitter';
import { TwitterClientErrorData } from './error';

interface Props {
  userId: string;
  cursor?: string;
  count?: number;
}

interface Response {
  ids: string[];
  nextCursor: string | null;
  errors: TwitterClientErrorData[];
}

interface TwitterResponse {
  ids: string[];
  next_cursor_str: string;
}

/**
 * userId のフォロワーの IDリストを取得
 * 5,000人まで 取得可能
 * 15分につき 15回取得可能
 */
export const getFollowersIdsSingle = (
  client: Twitter,
  { userId, cursor = '-1', count = 5000 }: Props
): Promise<Response> => {
  const params = {
    user_id: userId,
    cursor,
    count,
    stringify_ids: true,
  };
  const request = client.get('followers/ids', params);

  return request
    .then(
      (response: TwitterResponse): Response => {
        return {
          ids: response.ids,
          nextCursor: response.next_cursor_str,
          errors: [],
        };
      }
    )
    .catch(
      (e: TwitterClientErrorData[]): Response => {
        return {
          ids: [],
          nextCursor: null,
          errors: e,
        };
      }
    );
};

/**
 * userId のフォロワーの IDリストを取得
 * 15分につき 75,000人まで 取得可能
 */
export const getFollowersIds = async (
  client: Twitter,
  { userId, cursor = '-1', count = 75000 }: Props
): Promise<Response> => {
  const ids: string[] = [];
  const errors: TwitterClientErrorData[] = [];
  let nextCursor = cursor;

  while (ids.length < Math.max(count, 75000)) {
    const obj: Props = {
      userId,
      cursor: nextCursor,
    };
    const single = await getFollowersIdsSingle(client, obj);

    ids.push(...single.ids);
    nextCursor = single.nextCursor;
    errors.push(...single.errors);

    if (single.nextCursor === '0' || single.errors.length) {
      break;
    }
  }

  return { ids, nextCursor, errors };
};

export { Props as GetFollowersIdsProps, Response as GetFollowersIdsResponse };
