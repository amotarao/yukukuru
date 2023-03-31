import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { firestore } from '../../modules/firebase';

export const deleteTwitterIdFieldFromToken = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB',
  })
  .pubsub.schedule('*/3 * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    const collection = firestore.collection('tokens');
    const snapshot = await collection.orderBy('twitterId').limit(10).get();
    await Promise.all(
      snapshot.docs.map(async (doc) => {
        await doc.ref.update({
          twitterId: FieldValue.delete(),
        });
      })
    );
    console.log(`✔️ Completed ${snapshot.size} document(s).`);
  });
