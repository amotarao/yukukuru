import { QueueData } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import { getFollowers } from '../../utils/getFollowers';

export const onCreateQueueHandler = (
  snapshot: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
): void => {
  (async (): Promise<void> => {
    const now = new Date(context.timestamp);
    const id = snapshot.id;
    const { type, data } = snapshot.data() as QueueData;

    console.log('run queue', id, type);

    switch (type) {
      case 'getFollowers': {
        await getFollowers(data, now);
        return;
      }
    }
  })();
};
