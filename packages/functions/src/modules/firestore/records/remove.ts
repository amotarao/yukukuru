import { firestore } from '../../firebase';
import { bulkWriterErrorHandler } from '../error';

const usersCollection = firestore.collection('users');

/**
 * record を削除する
 */
export const removeRecord = async (uid: string, recordId: string): Promise<void> => {
  await usersCollection.doc(uid).collection('records').doc(recordId).delete();
};

/**
 * records を削除する
 */
export const removeRecords = async (uid: string, removeIds: string[]): Promise<void> => {
  const collection = usersCollection.doc(uid).collection('records');

  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);

  removeIds.forEach((id) => {
    bulkWriter.delete(collection.doc(id));
  });

  await bulkWriter.close();
};
