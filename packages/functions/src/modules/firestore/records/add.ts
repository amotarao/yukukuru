import { FirestoreDateLike, RecordData } from '@yukukuru/types';
import { firestore } from '../../firebase';
import { bulkWriterErrorHandler } from '../error';

const collection = firestore.collection('users');

/**
 * record を追加する
 */
export const addRecord = async (uid: string, data: RecordData<FirestoreDateLike>): Promise<void> => {
  await collection.doc(uid).collection('records').add(data);
};

const emptyRecord: RecordData<Date> = {
  type: 'kuru',
  user: {
    id: 'EMPTY',
    maybeDeletedOrSuspended: true,
  },
  durationStart: new Date(2000, 0),
  durationEnd: new Date(2000, 0),
};

/**
 * 空 record を追加する
 * @param uid 追加するユーザー
 */
export const addEmptyRecord = async (uid: string): Promise<void> => {
  await addRecord(uid, emptyRecord);
};

/**
 * records を追加する
 */
export const addRecords = async (uid: string, items: RecordData<FirestoreDateLike>[]): Promise<void> => {
  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);

  const recordsCollection = collection.doc(uid).collection('records');

  items.forEach((item) => {
    bulkWriter.set(recordsCollection.doc(), item);
  });

  await bulkWriter.close();
};
