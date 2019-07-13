import * as functions from 'firebase-functions';
import onCreateUserHandler from './functions/auth/onCreateUser';

export const onCreateUser = functions
  .region('asia-northeast1')
  .auth.user()
  .onCreate(onCreateUserHandler);
