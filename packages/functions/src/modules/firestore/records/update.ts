import { FirestoreDateLike, Record } from '@yukukuru/types';
import { firestore } from '../../firebase';
import { bulkWriterErrorHandler } from '../error';
import { getRecordsCollection } from '.';

/**
 * Records の durationStart をアップデート
 */
export const updateRecordsStart = async (
  uid: string,
  items: {
    id: string;
    start: Record<FirestoreDateLike>['durationStart'];
  }[]
): Promise<void> => {
  const collection = getRecordsCollection(uid);

  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);

  items.forEach((item) => {
    const data: Pick<Record<FirestoreDateLike>, 'durationStart'> = {
      durationStart: item.start,
    };
    bulkWriter.update(collection.doc(item.id), data);
  });

  await bulkWriter.close();
};
