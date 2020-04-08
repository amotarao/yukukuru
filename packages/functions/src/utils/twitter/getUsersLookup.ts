import * as _ from 'lodash';
import * as Twitter from 'twitter';
import { twitterClientErrorHandler, TwitterClientErrorData } from './error';
import { TwitterUserInterface } from '.';

export interface GetUsersLookupProps {
  usersId: string[];
}

/**
 * ユーザー情報を取得
 * 100人まで 取得可能
 * 15分につき 300回 実行可能
 */
export const getUsersLookupSingle = (
  client: Twitter,
  { usersId }: GetUsersLookupProps
): Promise<{ response: TwitterUserInterface[] } | { errors: TwitterClientErrorData[] }> => {
  return client
    .get('users/lookup', {
      user_id: usersId.join(','),
    })
    .then((response) => {
      return { response: response as TwitterUserInterface[] };
    })
    .catch(twitterClientErrorHandler);
};

/**
 * ユーザー情報を取得
 * 15分につき 30,000人まで 取得可能
 */
export const getUsersLookup = async (
  client: Twitter,
  { usersId }: GetUsersLookupProps
): Promise<{ response: TwitterUserInterface[] } | { errors: TwitterClientErrorData[] }> => {
  const users: TwitterUserInterface[] = [];
  const errors: TwitterClientErrorData[] = [];

  const lookup = _.chunk(_.uniq(usersId), 100).map(async (usersId) => {
    const result = await getUsersLookupSingle(client, { usersId });

    if ('errors' in result) {
      errors.push(...result.errors);
      return;
    }

    result.response.forEach(({ id_str, screen_name, name, profile_image_url_https }) => {
      const data: TwitterUserInterface = {
        id_str,
        screen_name,
        name,
        profile_image_url_https,
      };
      users.push(data);
    });
    return;
  });

  await Promise.all(lookup);

  if (users.length || !errors.length) {
    return { response: users };
  }

  return { errors };
};
