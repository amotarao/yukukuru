import { PubSub } from '@google-cloud/pubsub';
import { QueueTypeUpdateTwUsersData } from '@yukukuru/types';

const pubsub = new PubSub();
const topic = pubsub.topic('updateTwUsers');

export const publishUpdateTwUsers = async (items: QueueTypeUpdateTwUsersData['data'][]): Promise<void> => {
  const publishes = items.map(async (item) => {
    await topic.publishJSON(item);
  });
  await Promise.all(publishes);
};
