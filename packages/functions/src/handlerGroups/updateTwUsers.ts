import { MessageTopicName } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import { publishUpdateTwUsersHandler } from '../handlers/publishUpdateTwUsers';
import { runUpdateTwUsersHandler } from '../handlers/runUpdateTwUsers';

const topicName: MessageTopicName = 'updateTwUsers';

/** Twitter ユーザー情報更新 定期実行 */
export const publish = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(publishUpdateTwUsersHandler);

/** PubSub: Twitter ユーザー情報更新 個々の実行 */
export const run = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 20,
    memory: '256MB',
  })
  .pubsub.topic(topicName)
  .onPublish(runUpdateTwUsersHandler);
