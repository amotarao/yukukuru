import * as _ from 'lodash';
import { FirestoreDateLike, RecordData, RecordDataOld } from '@yukukuru/types';
import { firestore } from '../../../modules/firebase';

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
  const chunks = _.chunk(items, 500);

  const requests = chunks.map(async (items) => {
    const batch = firestore.batch();

    items.forEach((item) => {
      const data:
        | Pick<RecordData<FirestoreDateLike>, 'durationStart'>
        | Pick<RecordDataOld<FirestoreDateLike>, 'durationStart'> = {
        durationStart: item.start,
      };
      batch.update(collection.doc(item.id), data);
    });

    await batch.commit();
  });

  await Promise.all(requests);
};
