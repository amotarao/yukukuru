import { Token } from '@yukukuru/types';
import { CollectionReference } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';

const collection = firestore.collection('tokens') as CollectionReference<Token>;

export const getToken = async (userId: string): Promise<Token | null> => {
  const snapshot = await collection.doc(userId).get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data();
  if (!data) {
    return null;
  }

  const { twitterAccessToken = null, twitterAccessTokenSecret = null } = data;
  if (!twitterAccessToken || !twitterAccessTokenSecret) {
    return null;
  }
  return { twitterAccessToken, twitterAccessTokenSecret };
};

export const deleteToken = async (userId: string): Promise<void> => {
  await collection.doc(userId).delete();
};
