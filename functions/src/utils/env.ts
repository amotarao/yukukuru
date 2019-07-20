import * as functions from 'firebase-functions';

export const env = functions.config().app as {
  twitter_api_key: string;
  twitter_api_secret_key: string;
  twitter_access_token_key: string;
  twitter_access_token_secret: string;
  http_functions_key: string;
};
