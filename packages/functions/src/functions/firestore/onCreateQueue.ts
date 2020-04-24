import { QueueData } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import { getFollowers } from './queues/getFollowers';
import { checkIntegrity } from './queues/checkIntegrity';
import { updateTwUsers } from './queues/updateTwUsers';
import { convertRecords } from './queues/convertRecords';

export const onCreateQueueHandler = async (
  snapshot: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
): Promise<void> => {
  const now = new Date(context.timestamp);
  const id = snapshot.id;
  const queue = snapshot.data() as QueueData;

  console.log(
    JSON.stringify({
      type: `run queue ${queue.type}`,
      queueId: id,
      uid: queue.data.uid,
    })
  );

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
