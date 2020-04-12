import { FirestoreIdData, UserData, QueueTypeGetFollowersData } from '@yukukuru/types';
import { firestore } from '../modules/firebase';
import { addQueuesTypeGetFollowers } from '../utils/firestore/queues/addQueuesTypeGetFollowers';

export default async (): Promise<void> => {
  const now = new Date();
  // API は 15分で 75000人 の取得制限がある
  // 1回で 10000人 まで取れるので、2.5分間隔
  // 余裕を見て 3分間隔
  const time3 = new Date();
  time3.setMinutes(now.getMinutes() - 3);

  const time15 = new Date();
  time15.setMinutes(now.getMinutes() - 15);

  const allUsers = firestore
    .collection('users')
    .where('active', '==', true)
    .where('invalid', '==', false)
    .where('lastUpdated', '<', time15)
    .orderBy('lastUpdated')
    .limit(100)
    .get();

  const pausedUsers = firestore
    .collection('users')
    .where('active', '==', true)
    .where('invalid', '==', false)
    .where('pausedGetFollower', '==', true)
    .where('lastUpdated', '<', time3)
    .orderBy('lastUpdated')
    .limit(10)
    .get();

  const newUsers = firestore
    .collection('users')
    .where('active', '==', true)
    .where('invalid', '==', false)
    .where('newUser', '==', true)
    .limit(10)
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
