import * as functions from 'firebase-functions';
import { Topic } from '../modules/pubsub/topics';
import { getFollowersHandler } from './handlers/getFollowers';
import { onPublishGetFollowersHandler } from './handlers/onPublishGetFollowers';

/** フォロワー取得 定期実行 */
export const getFollowers = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(getFollowersHandler);

/** PubSub: フォロワー取得 個々の実行 */
export const onPublishGetFollowers = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 20,
    memory: '256MB',
  })
  .pubsub.topic(Topic.GetFollowers)
  .onPublish(onPublishGetFollowersHandler);
