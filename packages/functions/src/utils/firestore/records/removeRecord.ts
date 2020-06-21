import { firestore } from '../../../modules/firebase';

const usersCollection = firestore.collection('users');

interface Props {
  uid: string;
  recordId: string;
}

type Response = void;

/**
 * Records を削除する
 */
export const removeRecord = async ({ uid, recordId }: Props): Promise<Response> => {
  await usersCollection.doc(uid).collection('records').doc(recordId).delete();
};
