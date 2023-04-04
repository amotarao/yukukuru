import { RecordV2 } from '@yukukuru/types';
import { FieldValue, QuerySnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { firestore } from '../../modules/firebase';
import { getTwUsers } from '../../modules/firestore/twUsers';
import { usersCollection } from '../../modules/firestore/users';
import { convertTwUserDataToRecordV2User } from '../../modules/twitter-user-converter';

export const deleteLastUpdatedField = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    const snapshot = await usersCollection.orderBy('lastUpdated').limit(100).get();
    const bulkWriter = firestore.bulkWriter();
    snapshot.docs.forEach((doc) => {
      bulkWriter.update(doc.ref, {
        lastUpdated: FieldValue.delete(),
        nextCursor: FieldValue.delete(),
        currentWatchesId: FieldValue.delete(),
        pausedGetFollower: FieldValue.delete(),
      } as any);
    });
    await bulkWriter.close();
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
        if (!twUser) return false;
        await doc.ref.update({
          user: convertTwUserDataToRecordV2User(twUser),
        });
        return true;
      })
    );

    console.log(`updated ${result.filter((r) => r).length} items.`);
  });
