import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { firestore } from '../../modules/firebase';
import { bulkWriterErrorHandler } from '../../modules/firestore/error';
import { sharedTokensCollectionRef } from '../../modules/firestore/sharedToken';
import { tokensCollectionRef } from '../../modules/firestore/tokens';
import { usersCollectionRef } from '../../modules/firestore/users';

export const deleteFieldsSharedTokens = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 20,
    memory: '512MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    const bulkWriter = firestore.bulkWriter();
    bulkWriter.onWriteError(bulkWriterErrorHandler);

    const snapshot = await sharedTokensCollectionRef.orderBy('_lastUsed.v1_getFollowersIds').limit(300).get();
    snapshot.docs.forEach((doc) => {
      bulkWriter.update(doc.ref, {
        '_lastUsed.v1_getFollowersIds': FieldValue.delete(),
      } as any);
    });

    await bulkWriter.close();
    console.log(`${snapshot.size} docs deleted.`);
  });

export const deleteActiveFieldUser = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 20,
    memory: '512MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    const bulkWriter = firestore.bulkWriter();
    bulkWriter.onWriteError(bulkWriterErrorHandler);

    const activeSnapshot = await usersCollectionRef.orderBy('active').limit(300).get();
    activeSnapshot.docs.forEach((doc) => {
      bulkWriter.update(doc.ref, {
        active: FieldValue.delete(),
      } as any);
    });

    const deletedAuthSnapshot = await tokensCollectionRef.orderBy('deletedAuth').limit(300).get();
    deletedAuthSnapshot.docs.forEach((doc) => {
      bulkWriter.update(doc.ref, {
        deletedAuth: FieldValue.delete(),
      } as any);
    });

    await bulkWriter.close();
    console.log(`${[activeSnapshot, deletedAuthSnapshot].reduce((acc, cur) => acc + cur.size, 0)} docs deleted.`);
  });
