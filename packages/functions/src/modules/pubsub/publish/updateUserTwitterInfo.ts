import { PubSub } from '@google-cloud/pubsub';
import { UpdateUserTwitterInfoMessage } from '@yukukuru/types';
import { Topic } from '../topics';

const pubsub = new PubSub();
const topic = pubsub.topic(Topic.UpdateUserTwitterInfo);

export const publishUpdateUserTwitterInfo = async (items: UpdateUserTwitterInfoMessage['data'][]): Promise<void> => {
  const publishes = items.map(async (item) => {
    await topic.publishJSON(item);
  });
  await Promise.all(publishes);
};
