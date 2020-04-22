import { FirestoreDateLike, RecordData } from '@yukukuru/types';
import * as _ from 'lodash';
import { firestore } from '../../../modules/firebase';

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
  const chunks = _.chunk(items, 500);

  const requests = chunks.map(async (items) => {
    const batch = firestore.batch();

    items.forEach((item) => {
      batch.set(collection.doc(), item);
    });

    await batch.commit();
  });

  await Promise.all(requests);
};
