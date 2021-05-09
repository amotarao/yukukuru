import { PubSub } from '@google-cloud/pubsub';
import { Message } from '@yukukuru/types';

const pubsub = new PubSub();

export const publishMessage = async <T extends Message>(
  topicName: T['topicName'],
  items: T['data'][]
): Promise<void> => {
  const topic = pubsub.topic(topicName);
  const publishes = items.map(async (item) => {
    await topic.publishJSON(item);
  });
  await Promise.all(publishes);
};
