import * as functions from 'firebase-functions';
import * as Twitter from 'twitter';

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
