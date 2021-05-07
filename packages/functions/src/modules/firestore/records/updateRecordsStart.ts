import { FirestoreDateLike, RecordData, RecordDataOld } from '@yukukuru/types';
import { firestore } from '../../firebase';
import { bulkWriterErrorHandler } from '../error';

const usersCollection = firestore.collection('users');

interface Props {
  uid: string;
  items: {
    id: string;
    start: RecordData<FirestoreDateLike>['durationStart'] | RecordDataOld<FirestoreDateLike>['durationStart'];
  }[];
}

type Response = void;

/**
 * Records の durationStart をアップデート
 */
export const updateRecordsStart = async ({ uid, items }: Props): Promise<Response> => {
  const collection = usersCollection.doc(uid).collection('records');

  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);

  items.forEach((item) => {
    const data:
      | Pick<RecordData<FirestoreDateLike>, 'durationStart'>
      | Pick<RecordDataOld<FirestoreDateLike>, 'durationStart'> = {
      durationStart: item.start,
    };
    bulkWriter.update(collection.doc(item.id), data);
  });

  await bulkWriter.close();
};
