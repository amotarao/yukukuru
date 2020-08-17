import * as functions from 'firebase-functions';
import * as Twitter from 'twitter';

/**
 * @see https://developer.twitter.com/en/docs/twitter-api/v1/data-dictionary/overview/user-object
 */
export type TwitterUser = {
  id: number;
  id_str: string;
  name: string;
  screen_name: string;
  location: string;
  derived: any;
  url: string;
  description: string;
  protected: boolean;
  verified: boolean;
  followers_count: number;
  friends_count: number;
  listed_count: number;
  favourites_count: number;
  statuses_count: number;
  created_at: string;
  profile_banner_url: string;
  profile_image_url_https: string;
  default_profile: boolean;
  default_profile_image: boolean;
  withheld_in_countries: string[];
  withheld_scope: string;
};

export type AccessToken = Pick<Twitter.AccessTokenOptions, 'access_token_key' | 'access_token_secret'>;

export type TwitterApiResponseType<T> = Promise<{ success: true; data: T } | { success: false; error: any }>;

export const getClient = (accessToken?: AccessToken): Twitter => {
  if (!accessToken) {
    return new Twitter(functions.config().twitter);
  }

  return new Twitter({
    ...functions.config().twitter,
    ...accessToken,
  });
};
