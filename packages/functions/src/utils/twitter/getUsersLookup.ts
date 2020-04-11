/* eslint-disable @typescript-eslint/camelcase */
import chunk from 'lodash/chunk';
import uniq from 'lodash/uniq';
import { TwitterClientErrorData } from './error';
import { TwitterAccessToken, generateClient } from './generateClient';
import { TwitterUserData, TwitterUserAllData } from '.';

interface Props {
  /** Twitter UID リスト */
  usersId: string[];
}

interface Response {
  users: TwitterUserData[];
  errors: TwitterClientErrorData[];
}

/**
 * ユーザー情報を取得
 * 100人まで 取得可能
 * 15分につき 300回 実行可能
 */
const getUsersLookupSingle = (token: TwitterAccessToken, { usersId }: Props): Promise<Response> => {
  const params = {
    user_id: usersId.join(','),
  };
  const requset = generateClient(token).get('users/lookup', params);

  return requset
    .then((response) => {
      const usersAllData = response as TwitterUserAllData[];
      const usersData = usersAllData.map((allData) => {
        const data: TwitterUserData = {
          id_str: allData.id_str,
          screen_name: allData.screen_name,
          name: allData.name,
          profile_image_url_https: allData.profile_image_url_https,
        };
        return data;
      });
      return { users: usersData, errors: [] };
    })
    .catch((e) => {
      return {
        users: [],
        errors: e as TwitterClientErrorData[],
      };
    });
};

/**
 * ユーザー情報を取得
 * 15分につき 30,000人まで 取得可能
 */
export const getUsersLookup = async (token: TwitterAccessToken, { usersId }: Props): Promise<Response> => {
  const users: TwitterUserData[] = [];
  const errors: TwitterClientErrorData[] = [];

  const chunks = chunk(uniq(usersId), 100);
  const requests = chunks.map(async (usersId) => {
    const single = await getUsersLookupSingle(token, { usersId });
    users.push(...single.users);
    errors.push(...single.errors);
  });
  await Promise.all(requests);

  return {
    users,
    errors,
  };
};

export { Props as GetUsersLookupProps, Response as GetUsersLookupResponse };
