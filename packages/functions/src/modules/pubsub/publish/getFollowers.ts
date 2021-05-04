import { PubSub } from '@google-cloud/pubsub';
import { QueueTypeGetFollowersData } from '@yukukuru/types';

const pubsub = new PubSub();
const topic = pubsub.topic('getFollowers');

export const publishGetFollowers = async (items: QueueTypeGetFollowersData['data'][]): Promise<void> => {
  const publishes = items.map(async (item) => {
    await topic.publishJSON(item);
  });
  await Promise.all(publishes);
};
