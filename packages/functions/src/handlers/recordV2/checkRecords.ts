import { RecordV2 } from '@yukukuru/types';
import * as dayjs from 'dayjs';
import { QuerySnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { firestore } from '../../modules/firebase';
import { getSharedTokensForGetUsers } from '../../modules/firestore/sharedToken';
import { convertTwitterUserToRecordV2User } from '../../modules/twitter-user-converter';
import { getUsers } from '../../modules/twitter/api/users';
import { getClient } from '../../modules/twitter/client';

export const checkRecords = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('*/5 * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = dayjs(context.timestamp);
    const [token] = await getSharedTokensForGetUsers(now.subtract(15, 'minutes').toDate(), 1);

    const snapshot = (await firestore
      .collectionGroup('recordsV2')
      .where('user', '==', null)
      .orderBy('date', 'desc')
      .limit(100)
      .get()) as QuerySnapshot<RecordV2>;
    const twitterIds = snapshot.docs.map((doc) => doc.data().twitterId);

    const client = getClient({
      accessToken: token.data().accessToken,
      accessSecret: token.data().accessTokenSecret,
    });
    const twitterUsers = await getUsers(client, twitterIds);
    if ('error' in twitterUsers) {
      throw new Error('❌ Failed to get twitter users.');
    }

    const result = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const twUser = twitterUsers.users.find((twitterUser) => twitterUser.id === doc.data().twitterId);
        await doc.ref.update({ user: twUser ? convertTwitterUserToRecordV2User(twUser) : null });
      })
    );
    console.log(`updated ${result.length} items.`);
  });
