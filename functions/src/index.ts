import * as functions from 'firebase-functions';
import onCreateUserHandler from './functions/auth/onCreateUser';
import getFollowersHandler from './api/getFollowers';

export const getFollowers = functions.region('asia-northeast1').https.onRequest(async (_, res) => {
  await getFollowersHandler();
  res.status(200).end();
});

export const onCreateUser = functions
  .region('asia-northeast1')
  .auth.user()
  .onCreate(onCreateUserHandler);
