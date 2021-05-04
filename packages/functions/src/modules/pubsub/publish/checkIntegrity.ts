import { PubSub } from '@google-cloud/pubsub';
import { QueueTypeCheckIntegrityData } from '@yukukuru/types';

const pubsub = new PubSub();
const topic = pubsub.topic('checkIntegrity');

export const publishCheckIntegrity = async (items: QueueTypeCheckIntegrityData['data'][]): Promise<void> => {
  const publishes = items.map(async (item) => {
    const messageBuffer = Buffer.from(JSON.stringify(item), 'utf8');
    await topic.publish(messageBuffer);
  });
  await Promise.all(publishes);
};
