import { UserData, GetFollowersMessage } from '@yukukuru/types';
import * as dayjs from 'dayjs';
import * as functions from 'firebase-functions';
import * as _ from 'lodash';
import { firestore } from '../../modules/firebase';
import { getGroupFromTime } from '../../modules/group';
import { publishMessages } from '../../modules/pubsub/publish';

/** フォロワー取得 定期実行 */
export const publish = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = new Date(context.timestamp);
    const group = getGroupFromTime(1, now);

    // 15分前 (-1m)
    const time15 = dayjs(now).subtract(14, 'minutes').toDate();

    const allUsers = firestore
      .collection('users')
      .where('active', '==', true)
      .where('pausedGetFollower', '==', false)
      .where('lastUpdated', '<', time15)
      .where('group', '==', group)
      .select('nextCursor', 'lastUpdated')
      .get();

    const pausedUsers = firestore
      .collection('users')
      .where('active', '==', true)
      .where('pausedGetFollower', '==', true)
      .where('group', '==', group)
      .select('nextCursor', 'lastUpdated')
      .get();

    const [allUsersSnap, pausedUsersSnap] = await Promise.all([allUsers, pausedUsers]);
    const docs = _.uniqBy(_.flatten([allUsersSnap.docs, pausedUsersSnap.docs]), 'id');

    const items: GetFollowersMessage['data'][] = docs.map((doc) => ({
      uid: doc.id,
      nextCursor: doc.get('nextCursor') as UserData['nextCursor'],
      lastRun: (doc.get('lastUpdated') as UserData['lastUpdated']).toDate(),
      publishedAt: now,
    }));
    await publishMessages('getFollowers', items);

    console.log(`✔️ Completed publish ${items.length} message.`);
  });
