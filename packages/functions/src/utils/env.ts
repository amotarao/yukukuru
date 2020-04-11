import * as functions from 'firebase-functions';

export const env = functions.config().app as {
  http_functions_key: string;
};
