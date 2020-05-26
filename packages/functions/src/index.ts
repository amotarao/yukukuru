import * as functions from 'firebase-functions';
import { getFollowersHandler } from './handlers/getFollowers';
import { updateTwUsersHandler } from './handlers/updateTwUsers';
import { checkIntegrityHandler } from './handlers/checkIntegrity';
import { convertRecordsHandler } from './handlers/convertRecords';
import { onCreateUserHandler } from './handlers/onCreateUser';
import { onDeleteUserHandler } from './handlers/onDeleteUser';
import { onCreateWatchHandler } from './handlers/onCreateWatch';
import { onUpdateTokenHandler } from './handlers/onUpdateToken';
import { updateTokenHandler } from './handlers/updateToken';
import { onCreateQueueHandler } from './handlers/onCreateQueue';

const functionsBase = functions.region('asia-northeast1');

const pubSubRuntimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 20,
  memory: '512MB',
};

const functionsRuntimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 60,
  memory: '2GB',
};

const pubSubScheduleBuilder = (schedule: string): functions.pubSub.ScheduleBuilder =>
  functionsBase.runWith(pubSubRuntimeOptions).pubsub.schedule(schedule).timeZone('Asia/Tokyo');

/**
 * PubSub: フォロワー取得
 */
export const getFollowers = pubSubScheduleBuilder('* * * * *').onRun(getFollowersHandler);

/**
 * PubSub: Twitter ユーザー情報更新
 */
export const updateTwUsers = pubSubScheduleBuilder('*/12 * * * *').onRun(updateTwUsersHandler);

/**
 * PubSub: 整合性チェック
 */
export const checkIntegrity = pubSubScheduleBuilder('*/12 * * * *').onRun(checkIntegrityHandler);

/**
 * PubSub: record の変換
 */
export const convertRecords = pubSubScheduleBuilder('* * * * *').onRun(convertRecordsHandler);

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
  .onUpdate(onUpdateTokenHandler);

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
