import { QueueTypeGetFollowersData } from '@yukukuru/types';
import * as _ from 'lodash';
import { firestore } from '../../../modules/firebase';

const collection = firestore.collection('queues');

export const addQueuesTypeGetFollowers = async (items: QueueTypeGetFollowersData['data'][]): Promise<void> => {
  const chunks = _.chunk(items, 500);

  const requests = chunks.map(async (items) => {
    const batch = firestore.batch();

    items.forEach((item) => {
      const data: QueueTypeGetFollowersData = {
        type: 'getFollowers',
        data: item,
      };
      batch.set(collection.doc(), data);
    });

    await batch.commit();
  });

  await Promise.all(requests);
};
