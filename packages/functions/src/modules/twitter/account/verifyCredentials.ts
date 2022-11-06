import { ApiResponseError, TwitterApiReadOnly } from 'twitter-api-v2';
import { TwitterUser } from '..';
import { twitterClientErrorHandler } from '../error';

/**
 * @see https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/manage-account-settings/api-reference/get-account-verify_credentials
 */
export const getAccountVerifyCredentials = (
  client: TwitterApiReadOnly
): Promise<{ response: TwitterUser } | { error: ApiResponseError }> => {
  return client.v1
    .verifyCredentials({
      include_entities: true,
      skip_status: false,
      include_email: false,
    })
    .then((res) => {
      const { id_str, screen_name, name, profile_image_url_https, followers_count, verified } = res;
      const response: TwitterUser = {
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
