import * as functions from 'firebase-functions';
import { onUpdateTokenHandler } from './handlers/onUpdateToken';
import { updateTokenHandler } from './handlers/updateToken';

/** Twitter Token のアップデート */
export const updateToken = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .https.onCall(updateTokenHandler);

/** Firestore: トークンが更新されたときの処理 */
export const onFirestoreUpdateToken = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .firestore.document('tokens/{userId}')
  .onUpdate(onUpdateTokenHandler);
