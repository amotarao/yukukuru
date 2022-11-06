import * as functions from 'firebase-functions';
import { TwitterApi, TwitterApiReadOnly } from 'twitter-api-v2';

export const getClient = (options?: Partial<ConstructorParameters<typeof TwitterApi>>): TwitterApiReadOnly => {
  const client = new TwitterApi({
    appKey: functions.config().twitter.consumer_key as string,
    appSecret: functions.config().twitter.consumer_secret as string,
    accessToken: functions.config().twitter.access_token_key as string,
    accessSecret: functions.config().twitter.access_token_secret as string,
    ...options,
  });

  const readOnlyClient = client.readOnly;
  return readOnlyClient;
};
