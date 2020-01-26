import { firestore } from '../../../modules/firebase';
import { DateLike } from '../types';

export const collection = firestore.collection('queues');

export type QueueType = 'getFollowers' | 'compareFollowers' | 'getTwUsersProfile' | 'checkUnsuspended';

export type QueueStatus = 'waiting' | 'pending' | 'discontinued' | 'working' | 'completed';

export interface QueueBase {
  type: QueueType;
  status: QueueStatus;
  runAt: DateLike;
}

/**
 * 処理できるキューの status を working にする
 */
export async function runRunnableQueues(): Promise<void> {
  const now = new Date();
  const snapshot = await collection
    .where('status', 'in', ['waiting', 'pending'])
    .where('runAt', '<=', now)
    .limit(500)
    .get();
  console.log(`Runnable Queues Size is ${snapshot.size}.`);

  const batch = firestore.batch();
  snapshot.docs.forEach(({ ref }) => {
    batch.update(ref, { status: 'working' });
  });
  await batch.commit();
}

export * from './getFollowers';
export * from './compareFollowers';
