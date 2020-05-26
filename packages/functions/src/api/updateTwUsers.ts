import { FirestoreIdData, UserData, QueueTypeUpdateTwUsersData } from '@yukukuru/types';
import { firestore } from '../modules/firebase';
import { addQueuesTypeUpdateTwUsers } from '../utils/firestore/queues/addQueuesTypeUpdateTwUsers';
import { getGroupFromTime } from '../utils/group';
import { PubsubOnRunHandler } from '../types/functions';

export const updateTwUsersHandler: PubsubOnRunHandler = async () => {
  const now = new Date(Math.floor(new Date().getTime() / (60 * 1000)) * 60 * 1000);
  const group = getGroupFromTime(12, now);

  // 3日前
  const previous = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 60 * 1000);

  const usersSnap = await firestore
    .collection('users')
    .where('active', '==', true)
    .where('lastUpdatedTwUsers', '<', previous)
    .where('group', '==', group)
    .get();

  const docs: FirestoreIdData<UserData>[] = usersSnap.docs.map((doc) => {
    return {
      id: doc.id,
      data: doc.data() as UserData,
    };
  });
  console.log({ ids: docs.map((doc) => doc.id).join(','), count: docs.length });

  const items: QueueTypeUpdateTwUsersData['data'][] = docs.map((doc) => ({
    uid: doc.id,
  }));
  await addQueuesTypeUpdateTwUsers(items);
};
