import { FirestoreIdData, TwUserData } from '@yukukuru/types';
import { firestore } from '../../firebase';

const twUsersCollection = firestore.collection('twUsers');

type Response = FirestoreIdData<TwUserData> | null;

export const getTwUser = async (id: string): Promise<Response> => {
  const snapshot = await twUsersCollection.doc(id).get();

  if (!snapshot.exists) {
    return null;
  }

  return {
    id: snapshot.id,
    data: snapshot.data() as TwUserData,
  };
};
