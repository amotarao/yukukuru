import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { firestore } from '../../modules/firebase';
import { getGroupFromTime } from '../../modules/group';

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
    const snapshot = await collection.orderBy('twitterId').limit(100).get();
    await Promise.all(
      snapshot.docs.map(async (doc) => {
        await doc.ref.update({
          twitterId: FieldValue.delete(),
        });
      })
    );
    console.log(`✔️ Completed ${snapshot.size} document(s).`);
  });

export const addGetFollowersIdsField = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = new Date(context.timestamp);
    const group = getGroupFromTime(1, now);

    const usersCollection = firestore.collection('users');
    const snapshot = await usersCollection.where('group', '==', group).get();

    const bulkWriter = firestore.bulkWriter();
    await Promise.all(
      snapshot.docs.map(async (user) => {
        bulkWriter.set(
          firestore.collection('tokens').doc(user.id),
          {
            _lastUsed: {
              v1_getFollowersIds: new Date(2000, 0, 1),
              v2_getUserFollowers: new Date(2000, 0, 1),
              v2_getUsers: new Date(2000, 0, 1),
            },
          },
          { merge: true }
        );
      })
    );
    await bulkWriter.close();
    console.log(`✔️ Completed ${snapshot.size} document(s).`);
  });
