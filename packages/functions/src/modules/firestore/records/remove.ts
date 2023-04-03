import { firestore } from '../../firebase';
import { bulkWriterErrorHandler } from '../error';
import { getRecordsCollection } from '.';

/**
 * record を削除する
 */
export const removeRecord = async (uid: string, recordId: string): Promise<void> => {
  await getRecordsCollection(uid).doc(recordId).delete();
};

/**
 * records を削除する
 */
export const removeRecords = async (uid: string, removeIds: string[]): Promise<void> => {
  const collection = getRecordsCollection(uid);

  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);

  removeIds.forEach((id) => {
    bulkWriter.delete(collection.doc(id));
  });

  await bulkWriter.close();
};
