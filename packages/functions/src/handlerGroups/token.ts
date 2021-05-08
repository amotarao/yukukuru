import * as functions from 'firebase-functions';
import { updateUserActiveByUpdateTokenHandler } from '../handlers/updateUserActiveByUpdateToken';

/** Firestore: トークンが更新されたときの処理 */
export const onFirestoreUpdateToken = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .firestore.document('tokens/{userId}')
  .onUpdate(updateUserActiveByUpdateTokenHandler);
