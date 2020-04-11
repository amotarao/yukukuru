/* eslint-disable @typescript-eslint/camelcase */
import { TwitterClientErrorData } from './error';
import { TwitterAccessToken, generateClient } from './generateClient';

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
  token: TwitterAccessToken,
  { userId, cursor = '-1', count = 5000 }: Props
): Promise<Response> => {
  const params = {
    user_id: userId,
    cursor,
    count,
    stringify_ids: true,
  };
  const request = generateClient(token).get('followers/ids', params);

  return request
    .then(
      (response): Response => {
        const data = response as TwitterResponse;
        return {
          ids: data.ids,
          nextCursor: data.next_cursor_str,
          errors: [],
        };
      }
    )
    .catch(
      (e): Response => {
        return {
          ids: [],
          nextCursor: null,
          errors: e as TwitterClientErrorData[],
        };
      }
    );
};

/**
 * userId のフォロワーの IDリストを取得
 * 15分につき 75,000人まで 取得可能
 */
export const getFollowersIds = async (
  token: TwitterAccessToken,
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
    const single = await getFollowersIdsSingle(token, obj);

    ids.push(...single.ids);
    errors.push(...single.errors);

    if (single.nextCursor === '0') {
      nextCursor = single.nextCursor;
      break;
    }
    if (single.nextCursor === null || single.errors.length) {
      break;
    }

    nextCursor = single.nextCursor;
  }

  return { ids, nextCursor, errors };
};

export { Props as GetFollowersIdsProps, Response as GetFollowersIdsResponse };
