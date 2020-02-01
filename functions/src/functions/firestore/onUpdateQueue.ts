import * as functions from 'firebase-functions';
import { QueueBase } from '../../utils/firestore/queues';
import { onUpdateQueueTypeGetFollowers } from '../../handlers/firestore/onUpdateQueueTypeGetFollowers';
import { onUpdateQueueTypeCompareFollowers } from '../../handlers/firestore/onUpdateQueueTypeCompareFollowers';

type Props = functions.Change<FirebaseFirestore.DocumentSnapshot>;
type Context = functions.EventContext;

export default async function onUpdateQueue(props: Props, context: Context): Promise<void> {
  const type = props.after.get('type') as QueueBase['type'];

  switch (type) {
    case 'getFollowers': {
      await onUpdateQueueTypeGetFollowers(props, context);
      return;
    }
    case 'compareFollowers': {
      await onUpdateQueueTypeCompareFollowers(props, context);
      return;
    }
  }
}
