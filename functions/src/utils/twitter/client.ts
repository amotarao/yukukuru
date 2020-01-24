import * as functions from 'firebase-functions';
import * as Twitter from 'twitter';

type TwitterConfig = Pick<
  Twitter.AccessTokenOptions,
  'consumer_key' | 'consumer_secret' | 'access_token_key' | 'access_token_secret'
>;

/** Cloud Functions の Config からトークン類を取得 */
const baseConfig = functions.config().twitter as TwitterConfig;
/** 共通のクライアントを作成 */
const client = new Twitter(baseConfig);

export interface TwitterAccessToken {
  key: string;
  secret: string;
}

/**
 * Twitter Clientを返す
 *
 * AccessTokenがあれば、クライアントを生成して返す
 * nullの場合は、共通のクライアントを返す
 */
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
