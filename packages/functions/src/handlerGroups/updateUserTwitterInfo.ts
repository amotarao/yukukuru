import * as functions from 'firebase-functions';
import { publishUpdateUserTwitterInfoHandler } from '../handlers/publishUpdateUserTwitterInfo';
import { runUpdateUserTwitterInfoHandler } from '../handlers/runUpdateUserTwitterInfo';
import { Topic } from '../modules/pubsub/topics';

/** Twitter 情報更新 定期実行 */
export const publish = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(publishUpdateUserTwitterInfoHandler);

/** PubSub: Twitter 情報更新 個々の実行 */
export const run = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.topic(Topic.UpdateUserTwitterInfo)
  .onPublish(runUpdateUserTwitterInfoHandler);
