/* eslint-disable @typescript-eslint/camelcase */
import * as _ from 'lodash';
import * as Twitter from 'twitter';
import { TwitterClientErrorData } from './error';
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
const getUsersLookupSingle = (client: Twitter, { usersId }: Props): Promise<Response> => {
  const params = {
    user_id: usersId.join(','),
  };
  const requset = client.get('users/lookup', params);

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
export const getUsersLookup = async (client: Twitter, { usersId }: Props): Promise<Response> => {
  const users: TwitterUserData[] = [];
  const errors: TwitterClientErrorData[] = [];

  const chunks = _.chunk(_.uniq(usersId), 100);
  const requests = chunks.map(async (usersId) => {
    const single = await getUsersLookupSingle(client, { usersId });
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
