import { PubSub } from '@google-cloud/pubsub';
import { QueueTypeGetFollowersData } from '@yukukuru/types';

const pubsub = new PubSub();
const topic = pubsub.topic('getFollowers');

export const publishGetFollowers = async (items: QueueTypeGetFollowersData['data'][]): Promise<void> => {
  const publishes = items.map(async (item) => {
    const messageBuffer = Buffer.from(JSON.stringify(item), 'utf8');
    await topic.publish(messageBuffer);
  });
  await Promise.all(publishes);
};
