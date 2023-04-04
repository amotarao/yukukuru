import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { firestore } from '../../modules/firebase';
import { usersCollection } from '../../modules/firestore/users';

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
