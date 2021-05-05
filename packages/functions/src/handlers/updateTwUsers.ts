import * as functions from 'firebase-functions';
import { Topic } from '../modules/pubsub/topics';
import { onPublishUpdateTwUsersHandler } from './handlers/onPublishUpdateTwUsers';
import { updateTwUsersHandler } from './handlers/updateTwUsers';

/** PubSub: Twitter ユーザー情報更新 定期実行 */
export const updateTwUsers = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('*/12 * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(updateTwUsersHandler);

/** PubSub: Twitter ユーザー情報更新 個々の実行 */
export const onPublishUpdateTwUsers = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 30,
    memory: '1GB',
  })
  .pubsub.topic(Topic.UpdateTwUsers)
  .onPublish(onPublishUpdateTwUsersHandler);
