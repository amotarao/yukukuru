import * as Twitter from 'twitter';
import { TwitterClientErrorData } from './error';
import { TwitterUserData, TwitterUserAllData } from '.';

interface Props {
  userId: string;
  cursor?: string;
  count?: number;
}

interface Response {
  users: TwitterUserData[];
  nextCursor: string | null;
  errors: TwitterClientErrorData[];
}

interface TwitterResponse {
  users: TwitterUserAllData[];
  next_cursor_str: string;
}

/**
 * userId のフォロワーリストを取得
 * 200人まで 取得可能
 * 15分につき 15回取得可能
 */
const getFollowersListSingle = (client: Twitter, { userId, cursor = '-1', count = 200 }: Props): Promise<Response> => {
  const params = {
    user_id: userId,
    cursor,
    count,
    skip_status: true,
    include_user_entities: false,
  };
  const request = client.get('followers/list', params);

  return request
    .then((response: TwitterResponse) => {
      return {
        users: response.users,
        nextCursor: response.next_cursor_str,
        errors: [],
      };
    })
    .catch((e: TwitterClientErrorData[]) => {
      return {
        users: [],
        nextCursor: null,
        errors: e,
      };
    });
};

/**
 * userId のフォロワーリストを取得
 * 15分につき 3,000人まで 取得可能
 */
export const getFollowersList = async (
  client: Twitter,
  { userId, cursor = '-1', count = 3000 }: Props
): Promise<Response> => {
  const users: TwitterUserData[] = [];
  const errors: TwitterClientErrorData[] = [];
  let nextCursor = cursor;

  while (users.length < Math.max(count, 3000)) {
    const obj: Props = {
      userId,
      cursor: nextCursor,
    };
    const single = await getFollowersListSingle(client, obj);

    users.push(...single.users);
    nextCursor = single.nextCursor;
    errors.push(...single.errors);

    if (single.nextCursor === '0' || single.errors.length) {
      break;
    }
  }

  return { users, nextCursor, users };
};

export { Props as GetFollowersListProps, Response as GetFollowersListResponse };
