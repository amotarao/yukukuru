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
import { onPublishCheckIntegrityHandler } from './handlers/onPublishCheckIntegrity';
import { onPublishConvertRecordsHandler } from './handlers/onPublishConvertRecords';
import { onPublishGetFollowersHandler } from './handlers/onPublishGetFollowers';
import { onPublishUpdateTwUsersHandler } from './handlers/onPublishUpdateTwUsers';
import { Topic } from './modules/pubsub/topics';

const functionsBase = functions.region('asia-northeast1');

const pubSubRuntimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 20,
  memory: '512MB',
};

const firestoreRuntimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 60,
  memory: '2GB',
};

const httpsRuntimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 10,
  memory: '256MB',
};

const pubSubScheduleBuilder = (schedule: string): functions.pubsub.ScheduleBuilder =>
  functionsBase.runWith(pubSubRuntimeOptions).pubsub.schedule(schedule).timeZone('Asia/Tokyo');

const firestoreBuilder = (path: string): functions.firestore.DocumentBuilder =>
  functionsBase.runWith(firestoreRuntimeOptions).firestore.document(path);

/** PubSub: フォロワー取得 */
export const getFollowers = pubSubScheduleBuilder('* * * * *').onRun(getFollowersHandler);

/** PubSub: Twitter ユーザー情報更新 */
export const updateTwUsers = pubSubScheduleBuilder('*/12 * * * *').onRun(updateTwUsersHandler);

/** PubSub: 整合性チェック */
export const checkIntegrity = pubSubScheduleBuilder('*/12 * * * *').onRun(checkIntegrityHandler);

/** PubSub: record の変換 */
export const convertRecords = pubSubScheduleBuilder('* * * * *').onRun(convertRecordsHandler);

/** Twitter Token のアップデート */
export const updateToken = functionsBase.runWith(httpsRuntimeOptions).https.onCall(updateTokenHandler);

/** Auth: ユーザーが作成されたときの処理 */
export const onCreateUser = functionsBase.auth.user().onCreate(onCreateUserHandler);

/** Auth: ユーザーが削除されたときの処理 */
export const onDeleteUser = functionsBase.auth.user().onDelete(onDeleteUserHandler);

/** Firestore: トークンが更新されたときの処理 */
export const onFirestoreUpdateToken = firestoreBuilder('tokens/{userId}').onUpdate(onUpdateTokenHandler);

/** Firestore: watch が作成されたときの処理 */
export const onCreateWatch = firestoreBuilder('users/{userId}/watches/{watchId}').onCreate(onCreateWatchHandler);

export const onPublishCheckIntegrity = functionsBase
  .runWith(pubSubRuntimeOptions)
  .pubsub.topic(Topic.CheckIntegrity)
  .onPublish(onPublishCheckIntegrityHandler);

export const onPublishConvertRecords = functionsBase
  .runWith(pubSubRuntimeOptions)
  .pubsub.topic(Topic.ConvertRecords)
  .onPublish(onPublishConvertRecordsHandler);

export const onPublishGetFollowers = functionsBase
  .runWith(pubSubRuntimeOptions)
  .pubsub.topic(Topic.GetFollowers)
  .onPublish(onPublishGetFollowersHandler);

export const onPublishUpdateTwUsers = functionsBase
  .runWith(pubSubRuntimeOptions)
  .pubsub.topic(Topic.UpdateTwUsers)
  .onPublish(onPublishUpdateTwUsersHandler);
