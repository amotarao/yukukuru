import { PubSub } from '@google-cloud/pubsub';
import { QueueTypeGetFollowersData } from '@yukukuru/types';
import { Topic } from '../topics';

const pubsub = new PubSub();
const topic = pubsub.topic(Topic.GetFollowers);

export const publishGetFollowers = async (items: QueueTypeGetFollowersData['data'][]): Promise<void> => {
  const publishes = items.map(async (item) => {
    await topic.publishJSON(item);
  });
  await Promise.all(publishes);
};
