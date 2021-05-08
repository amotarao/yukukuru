import * as functions from 'firebase-functions';
import { initializeUserHandler } from '../handlers/initializeUser';
import { publishUpdateUserTwitterInfoHandler } from '../handlers/publishUpdateUserTwitterInfo';
import { runUpdateUserTwitterInfoHandler } from '../handlers/runUpdateUserTwitterInfo';
import { updateUserActiveByDeleteUserHandler } from '../handlers/updateUserActiveByDeleteUser';
import { Topic } from '../modules/pubsub/topics';

/** Auth: ユーザーが作成されたときの処理 */
export const onCreateUser = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .auth.user()
  .onCreate(initializeUserHandler);

/** Auth: ユーザーが削除されたときの処理 */
export const onDeleteUser = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .auth.user()
  .onDelete(updateUserActiveByDeleteUserHandler);

/** Twitter 情報更新 定期実行 */
export const updateUserTwitterInfo = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(publishUpdateUserTwitterInfoHandler);

/** PubSub: Twitter 情報更新 個々の実行 */
export const onPublishUpdateUserTwitterInfo = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.topic(Topic.UpdateUserTwitterInfo)
  .onPublish(runUpdateUserTwitterInfoHandler);
