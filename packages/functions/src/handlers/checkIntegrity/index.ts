import { MessageTopicName } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import { publishCheckIntegrityHandler } from './publishCheckIntegrity';
import { runCheckIntegrityHandler } from './runCheckIntegrity';

const topicName: MessageTopicName = 'checkIntegrity';

/** 整合性チェック 定期実行 */
export const publish = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('*/12 * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(publishCheckIntegrityHandler);

/** PubSub: 整合性チェック 個々の実行 */
export const run = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 30,
    memory: '1GB',
  })
  .pubsub.topic(topicName)
  .onPublish(runCheckIntegrityHandler);
