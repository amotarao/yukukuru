import { QueueData } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import { getFollowers } from '../../utils/getFollowers';
import { checkIntegrity } from '../../utils/checkIntegrity';
import { updateTwUsers } from '../../utils/updateTwUsers';

export const onCreateQueueHandler = async (
  snapshot: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
): Promise<void> => {
  const now = new Date(context.timestamp);
  const id = snapshot.id;
  const queue = snapshot.data() as QueueData;

  console.log('run queue', id, queue.type);

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
  }

  await snapshot.ref.delete();
};
