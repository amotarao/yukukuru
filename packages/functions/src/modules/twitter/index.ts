/**
 * User object
 *
 * @see https://developer.twitter.com/en/docs/twitter-api/v1/data-dictionary/object-model/user
 */
export interface TwitterUserObject {
  id_str: string;
  screen_name: string;
  name: string;
  profile_image_url_https: string;
  followers_count: number;
  verified: boolean;
}
