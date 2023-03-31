import { TokenData } from '@yukukuru/types';
import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { firestore } from '../../modules/firebase';
import { existsSharedToken, initializeSharedToken } from '../../modules/firestore/sharedToken';

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

export const createSharedToken = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 30,
    memory: '4GB',
  })
  .pubsub.schedule('0 * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = new Date(context.timestamp);
    const collection = firestore.collection('tokens');
    const snapshot = await collection.get();
    const result = await Promise.all(
      snapshot.docs.map(async (doc) => {
        try {
          const { twitterAccessToken: accessToken, twitterAccessTokenSecret: accessTokenSecret } =
            doc.data() as TokenData;
          const _invalid = !accessToken || !accessTokenSecret;
          const exists = await existsSharedToken(doc.id);
          if (exists) {
            return { status: 'skip' };
          }
          await initializeSharedToken(doc.id, {
            accessToken,
            accessTokenSecret,
            _invalid,
            _lastUpdated: now,
          });
          return { status: 'success' };
        } catch (e) {
          console.error(e);
          return { status: 'error' };
        }
      })
    );
    console.log(`✔️ Completed ${result.filter((r) => r.status === 'success').length} success document(s).`);
    console.log(`✔️ Completed ${result.filter((r) => r.status === 'skip').length} skip document(s).`);
    console.log(`✔️ Completed ${result.filter((r) => r.status === 'error').length} error document(s).`);
  });
