import * as functions from 'firebase-functions';
import { onCreateWatchHandler } from './handlers/onCreateWatch';

/** Firestore: watch が作成されたときの処理 */
export const onCreateWatch = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 20,
    memory: '512MB',
  })
  .firestore.document('users/{userId}/watches/{watchId}')
  .onCreate(onCreateWatchHandler);
