import { FirestoreDateLike, RecordData } from '@yukukuru/types';
import { firestore } from '../../firebase';

const usersCollection = firestore.collection('users');

interface Props {
  uid: string;
  data: RecordData<FirestoreDateLike>;
}

type Response = void;

/**
 * Records を追加する
 */
export const addRecord = async ({ uid, data }: Props): Promise<Response> => {
  await usersCollection.doc(uid).collection('records').add(data);
};
