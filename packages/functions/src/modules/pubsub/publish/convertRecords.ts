import { PubSub } from '@google-cloud/pubsub';
import { ConvertRecordsMessage } from '@yukukuru/types';
import { Topic } from '../topics';

const pubsub = new PubSub();
const topic = pubsub.topic(Topic.ConvertRecords);

export const publishConvertRecords = async (items: ConvertRecordsMessage['data'][]): Promise<void> => {
  const publishes = items.map(async (item) => {
    await topic.publishJSON(item);
  });
  await Promise.all(publishes);
};
