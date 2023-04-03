import * as functions from 'firebase-functions';
import { TwitterApi, TwitterApiReadOnly, TwitterApiTokens } from 'twitter-api-v2';

export const getManualClient = ({
  appKey,
  appSecret,
  accessToken,
  accessSecret,
}: Required<Pick<TwitterApiTokens, 'appKey' | 'appSecret' | 'accessToken' | 'accessSecret'>>) => {
  const client = new TwitterApi({
    appKey,
    appSecret,
    accessToken,
    accessSecret,
  });

  const readOnlyClient = client.readOnly;
  return readOnlyClient;
};

export const getClient = ({
  accessToken,
  accessSecret,
}: Required<Pick<TwitterApiTokens, 'accessToken' | 'accessSecret'>>): TwitterApiReadOnly => {
  return getManualClient({
    appKey: functions.config().twitter.consumer_key,
    appSecret: functions.config().twitter.consumer_secret,
    accessToken,
    accessSecret,
  });
};

export const getAppClient = (): TwitterApiReadOnly => {
  return getClient({
    accessToken: functions.config().twitter.access_token_key,
    accessSecret: functions.config().twitter.access_token_secret,
  });
};
