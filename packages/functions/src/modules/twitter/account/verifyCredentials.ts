import * as Twitter from 'twitter';
import { TwitterUserObject } from '..';
import { TwitterClientError, twitterClientErrorHandler } from '../error';

/**
 * @see https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/manage-account-settings/api-reference/get-account-verify_credentials
 */
export const getAccountVerifyCredentials = (
  client: Twitter
): Promise<{ response: TwitterUserObject } | { errors: TwitterClientError[] }> => {
  return client
    .get('account/verify_credentials', {
      include_entities: true,
      skip_status: false,
      include_email: false,
    })
    .then((res) => {
      const { id_str, screen_name, name, profile_image_url_https, followers_count, verified } = res;
      const response: TwitterUserObject = {
        id_str,
        screen_name,
        name,
        profile_image_url_https,
        followers_count,
        verified,
      };
      return { response };
    })
    .catch(twitterClientErrorHandler);
};
