import * as functions from 'firebase-functions';
import getFollowersHandler from './api/getFollowers';
import updateTwUsersHandler from './api/updateTwUsers';
import checkIntegrityHandler from './api/checkIntegrity';
import convertRecordsHandler from './api/convertRecords';
import onCreateUserHandler from './functions/auth/onCreateUser';
import onDeleteUserHandler from './functions/auth/onDeleteUser';
import onCreateWatchHandler from './functions/firestore/onCreateWatch';
import onFirestoreUpdateTokenHandler from './functions/firestore/onUpdateToken';
import { updateTokenHandler } from './handlers/updateToken';
import { onCreateQueueHandler } from './functions/firestore/onCreateQueue';

const functionsBase = functions.region('asia-northeast1');

const pubsubRuntimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 20,
  memory: '512MB',
};

const functionsRuntimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 60,
  memory: '2GB',
};

const pubsubScheduleBuilder = (schedule: string): functions.pubsub.ScheduleBuilder =>
  functionsBase.runWith(pubsubRuntimeOptions).pubsub.schedule(schedule).timeZone('Asia/Tokyo');

/**
 * 定期処理: フォロワー取得
 */
export const getFollowers = pubsubScheduleBuilder('* * * * *').onRun(getFollowersHandler);

/**
 * 定期処理: Twitter ユーザー情報更新
 */
export const updateTwUsers = pubsubScheduleBuilder('*/12 * * * *').onRun(updateTwUsersHandler);

/**
 * 定期処理: 整合性チェック
 */
export const checkIntegrity = pubsubScheduleBuilder('*/12 * * * *').onRun(checkIntegrityHandler);

/**
 * 定期処理: record の変換
 */
export const convertRecords = pubsubScheduleBuilder('* * * * *').onRun(convertRecordsHandler);

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
