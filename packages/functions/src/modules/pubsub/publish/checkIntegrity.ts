import { PubSub } from '@google-cloud/pubsub';
import { QueueTypeCheckIntegrityData } from '@yukukuru/types';

const pubsub = new PubSub();
const topic = pubsub.topic('checkIntegrity');

export const publishCheckIntegrity = async (items: QueueTypeCheckIntegrityData['data'][]): Promise<void> => {
  const publishes = items.map(async (item) => {
    await topic.publishJSON(item);
  });
  await Promise.all(publishes);
};
