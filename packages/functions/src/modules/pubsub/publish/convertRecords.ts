import { PubSub } from '@google-cloud/pubsub';
import { QueueTypeConvertRecordsData } from '@yukukuru/types';

const pubsub = new PubSub();
const topic = pubsub.topic('convertRecords');

export const publishConvertRecords = async (items: QueueTypeConvertRecordsData['data'][]): Promise<void> => {
  const publishes = items.map(async (item) => {
    const messageBuffer = Buffer.from(JSON.stringify(item), 'utf8');
    await topic.publish(messageBuffer);
  });
  await Promise.all(publishes);
};
