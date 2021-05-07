import { bulkWriterErrorHandler } from '../../../utils/firestore';
import { firestore } from '../../firebase';

const usersCollection = firestore.collection('users');

interface Props {
  uid: string;
  removeIds: string[];
}

type Response = void;

/**
 * Watches を削除する
 */
export const removeWatches = async ({ uid, removeIds }: Props): Promise<Response> => {
  const collection = usersCollection.doc(uid).collection('watches');

  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);

  removeIds.forEach((id) => {
    bulkWriter.delete(collection.doc(id));
  });

  await bulkWriter.close();
};
