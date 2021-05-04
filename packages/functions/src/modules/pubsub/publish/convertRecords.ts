import { PubSub } from '@google-cloud/pubsub';
import { QueueTypeConvertRecordsData } from '@yukukuru/types';

const pubsub = new PubSub();
const topic = pubsub.topic('convertRecords');

export const publishConvertRecords = async (items: QueueTypeConvertRecordsData['data'][]): Promise<void> => {
  const publishes = items.map(async (item) => {
    await topic.publishJSON(item);
  });
  await Promise.all(publishes);
};
