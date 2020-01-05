import { runRunnableQueues } from '../utils/firestore/queues';

export default async function runQueues(): Promise<void> {
  await runRunnableQueues();
}
