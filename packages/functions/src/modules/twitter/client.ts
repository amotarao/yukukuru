import * as functions from 'firebase-functions';
import * as Twitter from 'twitter';

export const getClient = (options?: Partial<Twitter.AccessTokenOptions>): Twitter => {
  const defaultOptions = functions.config().twitter as Twitter.AccessTokenOptions;
  return new Twitter({
    ...defaultOptions,
    ...options,
  });
};
