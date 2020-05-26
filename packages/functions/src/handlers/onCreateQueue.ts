import { QueueData } from '@yukukuru/types';
import { getFollowers } from './queues/getFollowers';
import { checkIntegrity } from './queues/checkIntegrity';
import { updateTwUsers } from './queues/updateTwUsers';
import { convertRecords } from './queues/convertRecords';
import { FirestoreOnCreateHandler } from '../types/functions';
import { log } from '../utils/log';

export const onCreateQueueHandler: FirestoreOnCreateHandler = async (snapshot, context) => {
  const now = new Date(context.timestamp);
  const id = snapshot.id;
  const queue = snapshot.data() as QueueData;

  log('onCreateQueue', queue.type, { queueId: id, uid: queue.data.uid });

  switch (queue.type) {
    case 'getFollowers': {
      await getFollowers(queue.data, now);
      break;
    }
    case 'checkIntegrity': {
      await checkIntegrity(queue.data, now);
      break;
    }
    case 'updateTwUsers': {
      await updateTwUsers(queue.data, now);
      break;
    }
    case 'convertRecords': {
      await convertRecords(queue.data, now);
      break;
    }
  }

  await snapshot.ref.delete();
};
