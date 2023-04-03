import * as functions from 'firebase-functions';
import { TwitterApi, TwitterApiReadOnly, TwitterApiTokens } from 'twitter-api-v2';

export const getClient = ({
  accessToken,
  accessSecret,
}: Required<Pick<TwitterApiTokens, 'accessToken' | 'accessSecret'>>): TwitterApiReadOnly => {
  const client = new TwitterApi({
    appKey: functions.config().twitter.consumer_key,
    appSecret: functions.config().twitter.consumer_secret,
    accessToken,
    accessSecret,
  });

  const readOnlyClient = client.readOnly;
  return readOnlyClient;
};

export const getAppClient = (): TwitterApiReadOnly => {
  return getClient({
    accessToken: functions.config().twitter.access_token_key,
    accessSecret: functions.config().twitter.access_token_secret,
  });
};
