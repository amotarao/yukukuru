import * as functions from 'firebase-functions';
import { onCreateUserHandler } from './handlers/onCreateUser';
import { onDeleteUserHandler } from './handlers/onDeleteUser';

/** Auth: ユーザーが作成されたときの処理 */
export const onCreateUser = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .auth.user()
  .onCreate(onCreateUserHandler);

/** Auth: ユーザーが削除されたときの処理 */
export const onDeleteUser = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .auth.user()
  .onDelete(onDeleteUserHandler);
