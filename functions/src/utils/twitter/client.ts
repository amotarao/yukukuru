import * as functions from 'firebase-functions';
import * as Twitter from 'twitter';

type TwitterConfig = Pick<Twitter.AccessTokenOptions, 'consumer_key' | 'consumer_secret' | 'access_token_key' | 'access_token_secret'>;

const baseConfig = functions.config().twitter as TwitterConfig;
const client = new Twitter(baseConfig);

export interface TwitterAccessToken {
  key: string;
  secret: string;
}

export function getClient(accessToken: TwitterAccessToken | null): Twitter {
  if (accessToken === null) {
    return client;
  }
  const config: TwitterConfig = {
    ...baseConfig,
    access_token_key: accessToken.key,
    access_token_secret: accessToken.secret,
  };
  return new Twitter(config);
}
