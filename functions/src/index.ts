import * as functions from 'firebase-functions';
import getFollowersHandler from './api/getFollowers';
import onCreateUserHandler from './functions/auth/onCreateUser';
import onDeleteUserHandler from './functions/auth/onDeleteUser';
import onFirestoreUpdateUserHandler from './functions/firestore/onUpdateUser';
import onFirestoreUpdateTokenHandler from './functions/firestore/onUpdateToken';
import { env } from './utils/env';

const runtimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 90,
  memory: '1GB',
};

export const getFollowers = functions
  .runWith(runtimeOptions)
  .region('asia-northeast1')
  .https.onRequest(async (req, res) => {
    if (req.query.key !== env.http_functions_key) {
      res.status(403).end();
      return;
    }
    await getFollowersHandler();
    res.status(200).end();
  });

export const onCreateUser = functions
  .region('asia-northeast1')
  .auth.user()
  .onCreate(onCreateUserHandler);

export const onDeleteUser = functions
  .region('asia-northeast1')
  .auth.user()
  .onDelete(onDeleteUserHandler);

export const onFirestoreUpdateUser = functions
  .region('asia-northeast1')
  .firestore.document('users/{userId}')
  .onUpdate(onFirestoreUpdateUserHandler);

export const onFirestoreUpdateToken = functions
  .region('asia-northeast1')
  .firestore.document('tokens/{userId}')
  .onUpdate(onFirestoreUpdateTokenHandler);
