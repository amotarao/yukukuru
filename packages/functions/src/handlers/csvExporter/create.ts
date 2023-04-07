import { Record, Timestamp } from '@yukukuru/types';
import { QuerySnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { firestore, bucket } from '../../modules/firebase';

const toDateText = (timestamp: Timestamp): string => {
  return timestamp.toDate().toISOString().slice(0, 19).replace('T', ' ');
};

export const create = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 60,
    memory: '2GB',
  })
  .firestore.document('csvExportRequests/{id}')
  .onCreate(async (snapshot) => {
    const type = snapshot.get('type') as 'records';
    const userId = snapshot.get('userId') as string;

    switch (type) {
      case 'records': {
        const recordsSnapshot = (await firestore
          .collection('users')
          .doc(userId)
          .collection('records')
          .orderBy('durationEnd')
          .get()) as QuerySnapshot<Record>;

        const head = ['id', 'type', 'durationStart', 'durationEnd', 'twitterId', 'maybeDeletedOrSuspended'].join(',');
        const rows = recordsSnapshot.docs.map((doc) => {
          const id = doc.id;
          const data = doc.data();

          const type = data['type'];
          const durationStart = toDateText(data.durationStart);
          const durationEnd = toDateText(data.durationEnd);
          const twitterId = data.user.id;
          const maybeDeletedOrSuspended = data.user.maybeDeletedOrSuspended;

          const row = [id, type, durationStart, durationEnd, twitterId, maybeDeletedOrSuspended].join(',');
          return row;
        });
        const csv = head + '\n' + rows.join('\n');

        const storageRef = `csv/${snapshot.id}.csv`;
        const file = bucket.file(storageRef);
        await file.save(csv, {
          contentType: 'text/csv',
        });

        await snapshot.ref.update({ storageRef });
      }
    }
  });
