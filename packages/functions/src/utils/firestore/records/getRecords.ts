import { FirestoreIdData, RecordData, RecordDataOld } from '@yukukuru/types';
import { firestore } from '../../../modules/firebase';

const usersCollection = firestore.collection('users');

interface Props {
  uid: string;
  cursor: Date;
  max?: Date;
}

type Response = FirestoreIdData<RecordData | RecordDataOld>[];

/**
 * Records を古い順に取得する
 */
export const getRecords = async ({ uid, cursor, max }: Props): Promise<Response> => {
  const collection = usersCollection.doc(uid).collection('records');
  const request = max
    ? collection.where('durationStart', '<', max).orderBy('durationStart').startAt(cursor).get()
    : collection.orderBy('durationStart').startAt(cursor).get();

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
