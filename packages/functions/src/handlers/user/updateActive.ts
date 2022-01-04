import * as functions from 'firebase-functions';
import { setUserDeletedAuth } from '../../modules/firestore/users/deletedAuth';
import { existsUserDocument } from '../../modules/firestore/users/exists';

/** Auth: ユーザーが削除されたときの処理 */
export const updateActive = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .auth.user()
  .onDelete(async ({ uid }) => {
    const exists = await existsUserDocument(uid);
    if (exists) {
      await setUserDeletedAuth(uid);
    }
  });
