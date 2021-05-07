import { FirestoreDateLike, RecordData } from '@yukukuru/types';
import { bulkWriterErrorHandler } from '../../../utils/firestore';
import { firestore } from '../../firebase';

const usersCollection = firestore.collection('users');

interface Props {
  uid: string;
  items: RecordData<FirestoreDateLike>[];
}

type Response = void;

/**
 * Records を追加する
 */
export const addRecords = async ({ uid, items }: Props): Promise<Response> => {
  const collection = usersCollection.doc(uid).collection('records');

  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);

  items.forEach((item) => {
    bulkWriter.set(collection.doc(), item);
  });

  await bulkWriter.close();
};
