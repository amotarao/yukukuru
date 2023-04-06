import * as functions from 'firebase-functions';
import { firestore } from '../../modules/firebase';

/** watches コレクション 削除 */
export const deleteWatches = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 30,
    memory: '512MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    const snapshot = await firestore.collectionGroup('watches').select().limit(300).get();
    const bulkWriter = firestore.bulkWriter();
    snapshot.docs.forEach((doc) => {
      bulkWriter.delete(doc.ref);
    });
    await bulkWriter.close();
    console.log(`deleted ${snapshot.docs.length} items.`);
  });
