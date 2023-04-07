import { RecordV2 } from '@yukukuru/types';
import { QuerySnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { firestore } from '../../modules/firebase';
import { getTwUsersByIds } from '../../modules/firestore/twUsers';
import { convertTwUserToRecordV2User } from '../../modules/twitter-user-converter';

export const checkRecords = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('*/12 * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    const snapshot = (await firestore
      .collectionGroup('recordsV2')
      .where('user', '==', null)
      .orderBy('date', 'desc')
      .limit(100)
      .get()) as QuerySnapshot<RecordV2>;
    const twitterIds = snapshot.docs.map((doc) => doc.data().twitterId);
    const twUsers = await getTwUsersByIds(twitterIds);
    const result = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const twUser = twUsers.find((twUser) => twUser.id === doc.data().twitterId);
        await doc.ref.update({ user: twUser ? convertTwUserToRecordV2User(twUser) : null });
      })
    );
    console.log(`updated ${result.length} items.`);
  });
