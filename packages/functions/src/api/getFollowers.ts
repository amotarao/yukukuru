import { FirestoreIdData, UserData, QueueTypeGetFollowersData } from '@yukukuru/types';
import { firestore } from '../modules/firebase';
import { addQueuesTypeGetFollowers } from '../utils/firestore/queues/addQueuesTypeGetFollowers';
import { getGroupFromTime } from '../utils/group';

export default async (): Promise<void> => {
  const now = new Date(Math.floor(new Date().getTime() / (60 * 1000)) * 60 * 1000);
  const group = getGroupFromTime(1, now);

  // 15分前
  const time15 = new Date(now.getTime() - 14 * 60 * 1000);
  // 60分前
  const time60 = new Date(now.getTime() - 59 * 60 * 1000);

  const allUsers = firestore
    .collection('users')
    .where('active', '==', true)
    .where('invalid', '==', false)
    .where('pausedGetFollower', '==', false)
    .where('lastUpdated', '<', time60)
    .where('group', '==', group)
    .get();

  const pausedUsers = firestore
    .collection('users')
    .where('active', '==', true)
    .where('invalid', '==', false)
    .where('pausedGetFollower', '==', true)
    .where('lastUpdated', '<', time15)
    .where('group', '==', group)
    .get();

  const newUsers = firestore
    .collection('users')
    .where('active', '==', true)
    .where('invalid', '==', false)
    .where('newUser', '==', true)
    .get();

  const [allUsersSnap, pausedUsersSnap, newUsersSnap] = await Promise.all([allUsers, pausedUsers, newUsers]);
  const docs: FirestoreIdData<UserData>[] = [...allUsersSnap.docs, ...pausedUsersSnap.docs, ...newUsersSnap.docs]
    .filter((x, i, self) => self.findIndex((y) => x.id === y.id) === i)
    .map((doc) => {
      return {
        id: doc.id,
        data: doc.data() as UserData,
      };
    });
  console.log({ ids: docs.map((doc) => doc.id).join(','), count: docs.length });

  const items: QueueTypeGetFollowersData['data'][] = docs.map((doc) => ({
    uid: doc.id,
    nextCursor: doc.data.nextCursor,
  }));
  await addQueuesTypeGetFollowers(items);
};
