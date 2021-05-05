import * as functions from 'firebase-functions';
export * as checkIntegrity from './handlers/checkIntegrity';
export * as convertRecords from './handlers/convertRecords';
export * as getFollowers from './handlers/getFollowers';
export * as updateTwUsers from './handlers/updateTwUsers';
import { onCreateUserHandler } from './handlers/handlers/onCreateUser';
import { onDeleteUserHandler } from './handlers/handlers/onDeleteUser';
import { onCreateWatchHandler } from './handlers/handlers/onCreateWatch';
import { onUpdateTokenHandler } from './handlers/handlers/onUpdateToken';
import { updateTokenHandler } from './handlers/handlers/updateToken';

const functionsBase = functions.region('asia-northeast1');

const firestoreRuntimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 60,
  memory: '2GB',
};

const httpsRuntimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 10,
  memory: '256MB',
};

const firestoreBuilder = (path: string): functions.firestore.DocumentBuilder =>
  functionsBase.runWith(firestoreRuntimeOptions).firestore.document(path);

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
