import { Timestamp } from '@firebase/firestore-types';
import * as functions from 'firebase-functions';
import { firestore, bucket } from '../../modules/firebase';

const toDateText = (timestamp: Timestamp): string => {
  return timestamp.toDate().toISOString().slice(0, 19).replace('T', ' ');
};

export const create = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 30,
    memory: '512MB',
  })
  .firestore.document('csvExportRequests/{id}')
  .onCreate(async (snapshot, context) => {
    const type = snapshot.get('type') as 'records';
    const userId = snapshot.get('userId') as string;

    switch (type) {
      case 'records': {
        const recordsSnapshot = await firestore
          .collection('users')
          .doc(userId)
          .collection('records')
          .orderBy('durationEnd')
          .get();

        const head = 'type,durationStart,durationEnd,id,maybeDeletedOrSuspended';
        const rows = recordsSnapshot.docs.map((doc) => {
          const type = doc.get('type') as 'yuku' | 'kuru';
          const durationStart = toDateText(doc.get('durationStart') as Timestamp);
          const durationEnd = toDateText(doc.get('durationEnd') as Timestamp);
          const id = doc.get('user.id') as string;
          const maybeDeletedOrSuspended = doc.get('user.maybeDeletedOrSuspended') as boolean;

          const row = [type, durationStart, durationEnd, id, maybeDeletedOrSuspended].join(',');
          return row;
        });
        const csv = head + '\n' + rows.join('\n');

        const storageRef = `csv/${snapshot.id}.csv`;
        const file = bucket.file(storageRef);
        await file.save(csv, {
          contentType: 'text/csv',
        });

        const now = new Date();
        const expires = new Date();
        expires.setHours(now.getHours() + 24);

        const [downloadUrl] = await file.getSignedUrl({
          action: 'read',
          expires,
        });
        await snapshot.ref.update({ downloadUrl });
      }
    }
  });
