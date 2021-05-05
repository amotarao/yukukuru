import { FirestoreIdData, UserData, GetFollowersMessage } from '@yukukuru/types';
import { firestore } from '../../modules/firebase';
import { publishGetFollowers } from '../../modules/pubsub/publish/getFollowers';
import { PubSubOnRunHandler } from '../../types/functions';
import { getGroupFromTime } from '../../utils/group';
import { log } from '../../utils/log';

export const getFollowersHandler: PubSubOnRunHandler = async () => {
  const now = new Date(Math.floor(new Date().getTime() / (60 * 1000)) * 60 * 1000);
  const group = getGroupFromTime(1, now);

  // 15分前
  const time15 = new Date(now.getTime() - 14 * 60 * 1000);
  // 60分前
  const time60 = new Date(now.getTime() - 59 * 60 * 1000);

  const allUsers = firestore
    .collection('users')
    .where('active', '==', true)
    .where('pausedGetFollower', '==', false)
    .where('lastUpdated', '<', time60)
    .where('group', '==', group)
    .get();

  const pausedUsers = firestore
    .collection('users')
    .where('active', '==', true)
    .where('pausedGetFollower', '==', true)
    .where('lastUpdated', '<', time15)
    .where('group', '==', group)
    .get();

  const [allUsersSnap, pausedUsersSnap] = await Promise.all([allUsers, pausedUsers]);
  const docs: FirestoreIdData<UserData>[] = [...allUsersSnap.docs, ...pausedUsersSnap.docs]
    .filter((x, i, self) => self.findIndex((y) => x.id === y.id) === i)
    .map((doc) => {
      return {
        id: doc.id,
        data: doc.data() as UserData,
      };
    });
  log('getFollowers', '', { ids: docs.map((doc) => doc.id), count: docs.length });

  const items: GetFollowersMessage['data'][] = docs.map((doc) => ({
    uid: doc.id,
    nextCursor: doc.data.nextCursor,
  }));
  await publishGetFollowers(items);
};
