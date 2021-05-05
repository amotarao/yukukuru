import * as functions from 'firebase-functions';
import { onCreateWatchHandler } from './handlers/onCreateWatch';

/** Firestore: watch が作成されたときの処理 */
export const onCreateWatch = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 60,
    memory: '2GB',
  })
  .firestore.document('users/{userId}/watches/{watchId}')
  .onCreate(onCreateWatchHandler);
