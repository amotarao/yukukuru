import { FirestoreDateLike, RecordV2 } from '@yukukuru/types';
import { CollectionReference, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';
import { bulkWriterErrorHandler } from '../error';

const getRecordsV2Collection = (docId: string) =>
  firestore.collection('users').doc(docId).collection('recordsV2') as CollectionReference<RecordV2<FirestoreDateLike>>;

export const addRecordsV2 = async (uid: string, items: RecordV2<FirestoreDateLike>[]): Promise<void> => {
  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);

  items.forEach((item) => {
    bulkWriter.set(getRecordsV2Collection(uid).doc(), item);
  });

  await bulkWriter.close();
};

export const getRecordsV2ByDuration = async (
  uid: string,
  startAt: Date,
  endAt?: Date
): Promise<QueryDocumentSnapshot<RecordV2>[]> => {
  const collection = getRecordsV2Collection(uid);
  const snapshot = endAt
    ? await collection.orderBy('date').startAt(startAt).endAt(endAt).get()
    : await collection.orderBy('date').startAt(startAt).get();
  return snapshot.docs as QueryDocumentSnapshot<RecordV2>[];
};

export const deleteRecordsV2 = async (uid: string, ids: string[]): Promise<void> => {
  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);

  ids.forEach((id) => {
    bulkWriter.delete(getRecordsV2Collection(uid).doc(id));
  });

  await bulkWriter.close();
};

export const setRecordsV2DeletedByCheckIntegrity = async (uid: string, ids: string[]): Promise<void> => {
  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);

  ids.forEach((id) => {
    bulkWriter.update(getRecordsV2Collection(uid).doc(id), {
      _deleted: true,
      _deletedBy: 'checkIntegrityV2',
    });
  });

  await bulkWriter.close();
};
