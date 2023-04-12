import * as dayjs from 'dayjs';
import { FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { firestore } from '../../modules/firebase';
import { getUserDocsByGroups, usersCollection } from '../../modules/firestore/users';
import { getGroupFromTime } from '../../modules/group';

export const renameLinkedUserIds = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 20,
    memory: '256MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = dayjs(context.timestamp);
    const groups = [
      getGroupFromTime(1, now.toDate()),
      getGroupFromTime(1, now.add(5, 'minutes').toDate()),
      getGroupFromTime(1, now.add(10, 'minutes').toDate()),
    ];
    const docs = await getUserDocsByGroups(groups);

    const bulkWriter = firestore.bulkWriter();
    await Promise.all(
      docs.map(async (doc) => {
        if (!('linkedUserIds' in doc.data())) {
          bulkWriter.update(doc.ref, {
            linkedUserIds: [],
          });
          return;
        }

        const allowedAccessUsers = doc.get('allowedAccessUsers') as string[] | undefined;
        if (allowedAccessUsers && allowedAccessUsers.length) {
          bulkWriter.update(doc.ref, {
            linkedUserIds: FieldValue.arrayUnion(...allowedAccessUsers),
          });
        }
        if ('allowedAccessUsers' in doc.data()) {
          bulkWriter.update(doc.ref, {
            allowedAccessUsers: FieldValue.delete(),
          } as any);
        }

        const snapshot = await usersCollection.where('linkedUserIds', 'array-contains', doc.id).get();
        if (snapshot.docs.length) {
          bulkWriter.update(doc.ref, {
            linkedUserIds: FieldValue.arrayUnion(...snapshot.docs.map((doc) => doc.id)),
          });
        }
      })
    );
    await bulkWriter.close();
  });
