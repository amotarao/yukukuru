import { FirestoreIdData, RecordData, RecordDataOld } from '@yukukuru/types';
import { firestore } from '../../firebase';

const usersCollection = firestore.collection('users');

/**
 * Records を古い順に取得する
 */
export const getRecords = async (
  uid: string,
  cursor: Date,
  max?: Date
): Promise<FirestoreIdData<RecordData | RecordDataOld>[]> => {
  const collection = usersCollection.doc(uid).collection('records');
  const request = max
    ? collection.orderBy('durationEnd').startAfter(cursor).endAt(max).get()
    : collection.orderBy('durationEnd').startAfter(cursor).get();

  const qs = await request.catch((): false => false);
  if (!qs) {
    return [];
  }

  const docs = qs.docs.map((doc) => {
    return {
      id: doc.id,
      data: doc.data() as RecordData | RecordDataOld,
    };
  });

  return docs;
};
