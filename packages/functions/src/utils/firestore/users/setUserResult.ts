import { FirestoreDateLike, UserData } from '@yukukuru/types';
import { firestore } from '../../../modules/firebase';

const collection = firestore.collection('users');

export const setUserResult = async (userId: string, watchId: string, nextCursor: string, date: Date): Promise<void> => {
  const ended = nextCursor === '0' || nextCursor === '-1';

  const data: Pick<
    UserData<FirestoreDateLike>,
    'nextCursor' | 'currentWatchesId' | 'pausedGetFollower' | 'lastUpdated' | 'newUser'
  > = {
    nextCursor: ended ? '-1' : nextCursor,
    currentWatchesId: ended ? '' : watchId,
    pausedGetFollower: !ended,
    lastUpdated: date,
    newUser: false,
  };

  await collection.doc(userId).set(data, { merge: true });
};
