import * as functions from 'firebase-functions';
import getFollowersHandler from './api/getFollowers';
import updateTwUsersHandler from './api/updateTwUsers';
import onCreateUserHandler from './functions/auth/onCreateUser';
import onDeleteUserHandler from './functions/auth/onDeleteUser';
import onFirestoreUpdateUserHandler from './functions/firestore/onUpdateUser';
import onFirestoreUpdateTokenHandler from './functions/firestore/onUpdateToken';
import { updateTokenHandler } from './handlers/updateToken';

const httpKey = functions.config().app.http_functions_key as string;

const builder = functions.region('asia-northeast1');

const httpsRuntimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 90,
  memory: '1GB',
};

const functionsRuntimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 60,
  memory: '1GB',
};

export const getFollowers = builder.runWith(httpsRuntimeOptions).https.onRequest(async (req, res) => {
  if (req.query.key !== httpKey) {
    res.status(403).end();
    return;
  }
  await getFollowersHandler();
  res.status(200).end();
});

export const updateTwUsers = builder.runWith(httpsRuntimeOptions).https.onRequest(async (req, res) => {
  if (req.query.key !== httpKey) {
    res.status(403).end();
    return;
  }
  await updateTwUsersHandler();
  res.status(200).end();
});

export const onCreateUser = builder.auth.user().onCreate(onCreateUserHandler);

export const onDeleteUser = builder.auth.user().onDelete(onDeleteUserHandler);

export const onFirestoreUpdateUser = builder
  .runWith(functionsRuntimeOptions)
  .firestore.document('users/{userId}')
  .onUpdate(onFirestoreUpdateUserHandler);

export const onFirestoreUpdateToken = builder.firestore
  .document('tokens/{userId}')
  .onUpdate(onFirestoreUpdateTokenHandler);

export const updateToken = builder.runWith({ timeoutSeconds: 10, memory: '256MB' }).https.onCall(updateTokenHandler);
