import { FirestoreDateLike, RecordV2 } from '@yukukuru/types';
import { CollectionReference } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';
import { bulkWriterErrorHandler } from '../error';

const getRecordsV2Collection = (docId: string) =>
  firestore.collection('users').doc(docId).collection('watchesV2') as CollectionReference<RecordV2<FirestoreDateLike>>;

export const addRecordsV2 = async (uid: string, items: RecordV2<FirestoreDateLike>[]): Promise<void> => {
  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);

  items.forEach((item) => {
    bulkWriter.set(getRecordsV2Collection(uid).doc(), item);
  });

  await bulkWriter.close();
};
