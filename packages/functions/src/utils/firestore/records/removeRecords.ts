import * as _ from 'lodash';
import { firestore } from '../../../modules/firebase';

const usersCollection = firestore.collection('users');

interface Props {
  uid: string;
  removeIds: string[];
}

type Response = void;

/**
 * Watches を削除する
 */
export const removeRecords = async ({ uid, removeIds }: Props): Promise<Response> => {
  const collection = usersCollection.doc(uid).collection('records');
  const chunks = _.chunk(removeIds, 500);

  const requests = chunks.map(async (ids) => {
    const batch = firestore.batch();

    ids.forEach((id) => {
      batch.delete(collection.doc(id));
    });

    await batch.commit();
  });

  await Promise.all(requests);
};
