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

    const invalidSnapshot = await sharedTokensCollectionRef.where('_invalid', '==', true).get();
    invalidSnapshot.docs.forEach((doc) => {
      bulkWriter.delete(doc.ref);
      bulkWriter.delete(tokensCollectionRef.doc(doc.id));
    });
    if (invalidSnapshot.docs.length) {
      await bulkWriter.close();
      console.log(`${invalidSnapshot.size} docs deleted.`);
      return;
    }

    const invalidTokensSnapshot = await tokensCollectionRef.where('twitterAccessToken', '==', '').get();
    invalidTokensSnapshot.docs.forEach((doc) => {
      bulkWriter.delete(doc.ref);
    });

    const hasInvalidSnapshot = await sharedTokensCollectionRef.where('_invalid', '==', false).limit(300).get();
    hasInvalidSnapshot.docs.forEach((doc) => {
      bulkWriter.update(doc.ref, {
        _invalid: FieldValue.delete(),
      } as any);
    });

    const hasInvalidV1Snapshot = await sharedTokensCollectionRef.orderBy('_invalidV1').limit(300).get();
    hasInvalidV1Snapshot.docs.forEach((doc) => {
      bulkWriter.update(doc.ref, {
        _invalidV1: FieldValue.delete(),
      } as any);
    });

    await bulkWriter.close();
    console.log(
      `${[invalidTokensSnapshot, hasInvalidSnapshot, hasInvalidV1Snapshot].reduce(
        (acc, cur) => acc + cur.size,
        0
      )} docs deleted.`
    );
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
