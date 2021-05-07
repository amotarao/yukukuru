import * as Twitter from 'twitter';
import { TwitterClientErrorData, twitterClientErrorHandler } from './error';
import { TwitterUserInterface } from '.';

/**
 * @see https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/manage-account-settings/api-reference/get-account-verify_credentials
 */
export const getVerifyCredentials = (
  client: Twitter
): Promise<{ response: Required<TwitterUserInterface> } | { errors: TwitterClientErrorData[] }> => {
  return client
    .get('account/verify_credentials', {
      include_entities: true,
      skip_status: false,
      include_email: false,
    })
    .then((res) => {
      const { id_str, screen_name, name, profile_image_url_https, followers_count } = res;
      const response: Required<TwitterUserInterface> = {
        id_str,
        screen_name,
        name,
        profile_image_url_https,
        followers_count,
      };
      return { response };
    })
    .catch(twitterClientErrorHandler);
};