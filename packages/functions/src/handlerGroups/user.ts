import * as functions from 'firebase-functions';
import { initializeUserHandler } from '../handlers/initializeUser';
import { updateUserActiveByDeleteUserHandler } from '../handlers/updateUserActiveByDeleteUser';

/** Auth: ユーザーが作成されたときの処理 */
export const initialize = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .auth.user()
  .onCreate(initializeUserHandler);

/** Auth: ユーザーが削除されたときの処理 */
export const updateActive = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .auth.user()
  .onDelete(updateUserActiveByDeleteUserHandler);
