import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { firestore } from '../../modules/firebase';
import { usersCollection } from '../../modules/firestore/users';

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

/** watches コレクション 削除 */
export const deleteWatches = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    const snapshot = await firestore.collectionGroup('watches').limit(300).get();
    const bulkWriter = firestore.bulkWriter();
    snapshot.docs.forEach((doc) => {
      bulkWriter.delete(doc.ref);
    });
    await bulkWriter.close();
    console.log(`deleted ${snapshot.docs.length} items.`);
  });
