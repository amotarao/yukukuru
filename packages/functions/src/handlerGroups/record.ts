import * as functions from 'firebase-functions';
import { generateRecordsHandler } from '../handlers/generateRecords';

/** Firestore: watch が作成されたときの処理 */
export const generate = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 20,
    memory: '512MB',
  })
  .firestore.document('users/{userId}/watches/{watchId}')
  .onCreate(generateRecordsHandler);
