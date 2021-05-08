import * as functions from 'firebase-functions';
import { publishCheckIntegrityHandler } from '../handlers/publishCheckIntegrity';
import { runCheckIntegrityHandler } from '../handlers/runCheckIntegrity';
import { Topic } from '../modules/pubsub/topics';

/** 整合性チェック 定期実行 */
export const checkIntegrity = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('*/12 * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(publishCheckIntegrityHandler);

/** PubSub: 整合性チェック 個々の実行 */
export const onPublishCheckIntegrity = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 30,
    memory: '1GB',
  })
  .pubsub.topic(Topic.CheckIntegrity)
  .onPublish(runCheckIntegrityHandler);
