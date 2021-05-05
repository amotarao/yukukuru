import * as functions from 'firebase-functions';
import { Topic } from '../modules/pubsub/topics';
import { convertRecordsHandler } from './handlers/convertRecords';
import { onPublishConvertRecordsHandler } from './handlers/onPublishConvertRecords';

/** PubSub: record の変換 定期実行 */
export const convertRecords = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(convertRecordsHandler);

/** PubSub: record の変換 個々の実行 */
export const onPublishConvertRecords = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 30,
    memory: '1GB',
  })
  .pubsub.topic(Topic.ConvertRecords)
  .onPublish(onPublishConvertRecordsHandler);
