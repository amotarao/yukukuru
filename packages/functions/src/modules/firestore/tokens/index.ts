import { Token } from '@yukukuru/types';
import { CollectionReference } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';
import { setUserToNotActive } from '../users/active';

const collection = firestore.collection('tokens') as CollectionReference<Token>;

export const getToken = async (userId: string): Promise<Token | null> => {
  const snapshot = await collection.doc(userId).get();
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

export const setTokenInvalid = async (userId: string): Promise<void> => {
  const user = setUserToNotActive(userId);

  const data: Pick<Token, 'twitterAccessToken' | 'twitterAccessTokenSecret'> = {
    twitterAccessToken: '',
    twitterAccessTokenSecret: '',
  };
  const token = collection.doc(userId).update(data);

  await Promise.all([user, token]);
};
