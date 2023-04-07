import * as functions from 'firebase-functions';
import { getStripeRole } from '../../modules/auth/claim';
import { firestore } from '../../modules/firebase';

export const moveDeletedUsers = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('*/5 * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    const snapshot = await firestore.collection('users').where('deletedAuth', '==', true).limit(100).get();

    if (snapshot.empty) {
      throw new Error('❌ No documents.');
    }

    const bulkWriter = firestore.bulkWriter();
    await Promise.all(
      snapshot.docs.map(async (doc) => {
        const role = await getStripeRole(doc.id);
        bulkWriter.set(firestore.collection('deletedUsers').doc(doc.id), {
          role,
          twitter: doc.data().twitter,
        });
        bulkWriter.delete(doc.ref);
      })
    );
    await bulkWriter.close();

    console.log(`✔️ Deleted ${snapshot.size} documents.`);
  });
