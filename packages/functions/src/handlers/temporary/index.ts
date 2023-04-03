import { Record } from '@yukukuru/types';
import * as dayjs from 'dayjs';
import { CollectionReference, FieldValue } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { getUserDocsByGroups } from '../../modules/firestore/users';
import { getGroupFromTime } from '../../modules/group';

export const fixRecord = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 30,
    memory: '512MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = dayjs(context.timestamp);

    const groups = [getGroupFromTime(1, now.toDate())];
    const docs = await getUserDocsByGroups(groups);

    await Promise.all(
      docs.map(async (doc) => {
        const recordsCollection = doc.ref.collection('records') as CollectionReference<Record>;
        const snapshot = await recordsCollection.orderBy('user.name').get();
        console.log(doc.id, snapshot.size);
        await Promise.all(
          snapshot.docs.map(async (doc) => {
            const displayName = doc.get('user.name');
            const updatingData = {
              'user.displayName': displayName,
              'user.lastUpdated': FieldValue.delete(),
            } as any;
            await doc.ref.update(updatingData);
          })
        );
      })
    );
  });
