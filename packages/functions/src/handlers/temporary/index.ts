import { RecordV2 } from '@yukukuru/types';
import { QuerySnapshot, FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { firestore } from '../../modules/firebase';
import { getTwUsers } from '../../modules/firestore/twUsers';
import { usersCollection } from '../../modules/firestore/users';
import { convertTwUserToRecordV2User } from '../../modules/twitter-user-converter';

export const deleteGetFollowersV1Field = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    const snapshot = await usersCollection.orderBy('_getFollowersV1Status').limit(100).get();
    await Promise.all(
      snapshot.docs.map(async (doc) => {
        await doc.ref.update({
          _getFollowersV1Status: FieldValue.delete(),
        } as any);
      })
    );
    console.log(`deleted ${snapshot.docs.length} items.`);
  });

export const bindTwUserRecordV2 = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('*/5 * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    const snapshot = (await firestore.collectionGroup('recordsV2').get()) as QuerySnapshot<RecordV2>;
    const targetDocs = snapshot.docs.filter((doc) => !doc.data().user);
    const twitterIds = targetDocs.map((doc) => doc.data().twitterId);
    const twUsers = await getTwUsers(twitterIds);
    const result = await Promise.all(
      targetDocs.map(async (doc) => {
        const twUser = twUsers.find((twUser) => twUser.id === doc.data().twitterId);
        await doc.ref.update({
          user: twUser ? convertTwUserToRecordV2User(twUser) : null,
        });
      })
    );
    console.log(`updated ${result.length} items.`);
  });
