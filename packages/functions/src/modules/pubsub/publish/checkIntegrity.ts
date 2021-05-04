import { PubSub } from '@google-cloud/pubsub';
import { CheckIntegrityMessage } from '@yukukuru/types';
import { Topic } from '../topics';

const pubsub = new PubSub();
const topic = pubsub.topic(Topic.CheckIntegrity);

export const publishCheckIntegrity = async (items: CheckIntegrityMessage['data'][]): Promise<void> => {
  const publishes = items.map(async (item) => {
    await topic.publishJSON(item);
  });
  await Promise.all(publishes);
};
