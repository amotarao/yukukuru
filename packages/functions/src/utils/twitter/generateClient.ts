/* eslint-disable @typescript-eslint/camelcase */
import * as functions from 'firebase-functions';
import Twitter, { AccessTokenOptions } from 'twitter';

export type TwitterAccessToken = Pick<AccessTokenOptions, 'access_token_key' | 'access_token_secret'> | null;

const baseToken = functions.config().twitter as Pick<
  AccessTokenOptions,
  'consumer_key' | 'consumer_secret' | 'access_token_key' | 'access_token_secret'
>;
const baseClient = new Twitter(baseToken);

export const generateClient = (token: TwitterAccessToken): Twitter => {
  if (token === null) {
    return baseClient;
  }
  return new Twitter({ ...baseToken, ...token });
};
