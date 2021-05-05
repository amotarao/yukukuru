import { PubSub } from '@google-cloud/pubsub';
import { UpdateTwUsersMessage } from '@yukukuru/types';
import { Topic } from '../topics';

const pubsub = new PubSub();
const topic = pubsub.topic(Topic.UpdateTwUsers);

export const publishUpdateTwUsers = async (items: UpdateTwUsersMessage['data'][]): Promise<void> => {
  const publishes = items.map(async (item) => {
    await topic.publishJSON(item);
  });
  await Promise.all(publishes);
};
