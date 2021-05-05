import * as functions from 'firebase-functions';
import { Topic } from '../modules/pubsub/topics';
import { checkIntegrityHandler } from './handlers/checkIntegrity';
import { onPublishCheckIntegrityHandler } from './handlers/onPublishCheckIntegrity';

/** PubSub: 整合性チェック 定期実行 */
export const checkIntegrity = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('*/12 * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(checkIntegrityHandler);

/** PubSub: 整合性チェック 個々の実行 */
export const onPublishCheckIntegrity = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 30,
    memory: '1GB',
  })
  .pubsub.topic(Topic.CheckIntegrity)
  .onPublish(onPublishCheckIntegrityHandler);
