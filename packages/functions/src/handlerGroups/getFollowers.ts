import * as functions from 'firebase-functions';
import { publishGetFollowersHandler } from '../handlers/publishGetFollowers';
import { runGetFollowersHandler } from '../handlers/runGetFollowers';
import { Topic } from '../modules/pubsub/topics';

/** フォロワー取得 定期実行 */
export const getFollowers = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(publishGetFollowersHandler);

/** PubSub: フォロワー取得 個々の実行 */
export const onPublishGetFollowers = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 20,
    memory: '256MB',
  })
  .pubsub.topic(Topic.GetFollowers)
  .onPublish(runGetFollowersHandler);
