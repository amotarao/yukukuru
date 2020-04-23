import * as functions from 'firebase-functions';
import getFollowersHandler from './api/getFollowers';
import updateTwUsersHandler from './api/updateTwUsers';
import checkIntegrityHandler from './api/checkIntegrity';
import onCreateUserHandler from './functions/auth/onCreateUser';
import onDeleteUserHandler from './functions/auth/onDeleteUser';
import onCreateWatchHandler from './functions/firestore/onCreateWatch';
import onFirestoreUpdateTokenHandler from './functions/firestore/onUpdateToken';
import { updateTokenHandler } from './handlers/updateToken';
import { onCreateQueueHandler } from './functions/firestore/onCreateQueue';

const functionsBase = functions.region('asia-northeast1');

const httpsRuntimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 20,
  memory: '512MB',
};

const functionsRuntimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 60,
  memory: '1GB',
};

/**
 * 定期処理: フォロワー取得
 */
export const getFollowers = functionsBase.runWith(httpsRuntimeOptions).https.onRequest((req, res) => {
  (async (): Promise<void> => {
    if (req.query.key !== (functions.config().https.key as string)) {
      res.status(403).end();
      return;
    }
    await getFollowersHandler();
    res.status(200).send('success');
  })();
});

/**
 * 定期処理: Twitter ユーザー情報更新
 */
export const updateTwUsers = functionsBase.runWith(httpsRuntimeOptions).https.onRequest((req, res) => {
  (async (): Promise<void> => {
    if (req.query.key !== (functions.config().https.key as string)) {
      res.status(403).end();
      return;
    }
    await updateTwUsersHandler();
    res.status(200).send('success');
  })();
});

/**
 * 定期処理: 整合性チェック
 */
export const checkIntegrity = functionsBase.runWith(httpsRuntimeOptions).https.onRequest((req, res) => {
  (async (): Promise<void> => {
    if (req.query.key !== (functions.config().https.key as string)) {
      res.status(403).end();
      return;
    }
    await checkIntegrityHandler();
    res.status(200).send('success');
  })();
});

/**
 * Twitter Token のアップデート
 */
export const updateToken = functionsBase
  .runWith({ timeoutSeconds: 10, memory: '256MB' })
  .https.onCall(updateTokenHandler);

/**
 * Auth: ユーザーが作成されたときの処理
 */
export const onCreateUser = functionsBase.auth.user().onCreate(onCreateUserHandler);

/**
 * Auth: ユーザーが削除されたときの処理
 */
export const onDeleteUser = functionsBase.auth.user().onDelete(onDeleteUserHandler);

/**
 * Firestore: トークンが更新されたときの処理
 */
export const onFirestoreUpdateToken = functionsBase.firestore
  .document('tokens/{userId}')
  .onUpdate(onFirestoreUpdateTokenHandler);

/**
 * Firestore: watch が作成されたときの処理
 */
export const onCreateWatch = functionsBase
  .runWith(functionsRuntimeOptions)
  .firestore.document('users/{userId}/watches/{watchId}')
  .onCreate(onCreateWatchHandler);

/**
 * Firestore: queue が作成されたときの処理
 */
export const onCreateQueue = functionsBase
  .runWith(functionsRuntimeOptions)
  .firestore.document('queues/{queueId}')
  .onCreate(onCreateQueueHandler);
