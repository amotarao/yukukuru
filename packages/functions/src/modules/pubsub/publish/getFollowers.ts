import { PubSub } from '@google-cloud/pubsub';
import { GetFollowersMessage } from '@yukukuru/types';
import { Topic } from '../topics';

const pubsub = new PubSub();
const topic = pubsub.topic(Topic.GetFollowers);

export const publishGetFollowers = async (items: GetFollowersMessage['data'][]): Promise<void> => {
  const publishes = items.map(async (item) => {
    await topic.publishJSON(item);
  });
  await Promise.all(publishes);
};
