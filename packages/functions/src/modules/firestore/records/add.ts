import { FirestoreDateLike, Record } from '@yukukuru/types';
import { firestore } from '../../firebase';
import { bulkWriterErrorHandler } from '../error';
import { getRecordsCollection } from '.';

/**
 * record を追加する
 */
export const addRecord = async (uid: string, data: Record<FirestoreDateLike>): Promise<void> => {
  await getRecordsCollection(uid).add(data);
};

/**
 * records を追加する
 */
export const addRecords = async (uid: string, items: Record<FirestoreDateLike>[]): Promise<void> => {
  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);

  const recordsCollection = getRecordsCollection(uid);

  items.forEach((item) => {
    bulkWriter.set(recordsCollection.doc(), item);
  });

  await bulkWriter.close();
};
