import { FirestoreDateLike, RecordV2, RecordV2User } from '@yukukuru/types';
import {
  CollectionGroup,
  CollectionReference,
  DocumentReference,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { firestore } from '../../firebase';
import { bulkWriterErrorHandler } from '../error';

const getRecordsV2Collection = (docId: string) =>
  firestore.collection('users').doc(docId).collection('recordsV2') as CollectionReference<RecordV2<FirestoreDateLike>>;

const recordsV2CollectionGroup = firestore.collectionGroup('recordsV2') as CollectionGroup<RecordV2<FirestoreDateLike>>;

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

export const getRecordsV2NullTwitterUser = async (): Promise<QueryDocumentSnapshot<RecordV2>[]> => {
  const snapshot = await recordsV2CollectionGroup.where('user', '==', null).orderBy('date', 'desc').limit(100).get();
  return snapshot.docs as QueryDocumentSnapshot<RecordV2>[];
};

export const setRecordsV2TwitterUser = async (
  items: { ref: DocumentReference<RecordV2>; data: RecordV2User }[]
): Promise<void> => {
  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);

  items.forEach((item) => {
    bulkWriter.update(item.ref, { user: item.data });
  });

  await bulkWriter.close();
};
