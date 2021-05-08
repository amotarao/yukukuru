import { UserData, GetFollowersMessage } from '@yukukuru/types';
import * as _ from 'lodash';
import { firestore } from '../../modules/firebase';
import { getGroupFromTime } from '../../modules/group';
import { publishGetFollowers } from '../../modules/pubsub/publish/getFollowers';
import { PubSubOnRunHandler } from '../../types/functions';

export const getFollowersHandler: PubSubOnRunHandler = async () => {
  const now = new Date(Math.floor(new Date().getTime() / (60 * 1000)) * 60 * 1000);
  const group = getGroupFromTime(1, now);

  // 60分前 (-1m)
  const time60 = new Date(now.getTime() - 59 * 60 * 1000);

  const allUsers = firestore
    .collection('users')
    .where('active', '==', true)
    .where('pausedGetFollower', '==', false)
    .where('lastUpdated', '<', time60)
    .where('group', '==', group)
    .select('nextCursor')
    .get();

  const pausedUsers = firestore
    .collection('users')
    .where('active', '==', true)
    .where('pausedGetFollower', '==', true)
    .where('group', '==', group)
    .select('nextCursor')
    .get();

  const [allUsersSnap, pausedUsersSnap] = await Promise.all([allUsers, pausedUsers]);
  const docs = _.uniqBy(_.flatten([allUsersSnap.docs, pausedUsersSnap.docs]), 'id');

  const items: GetFollowersMessage['data'][] = docs.map((doc) => ({
    uid: doc.id,
    nextCursor: doc.get('nextCursor') as UserData['nextCursor'],
  }));
  await publishGetFollowers(items);
};
