import { TokenData } from '@yukukuru/types';
import { CollectionReference } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';
import { setUserToNotActive } from '../users/active';

const collection = firestore.collection('tokens') as CollectionReference<TokenData>;

export const getToken = async (userId: string): Promise<TokenData | null> => {
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

  const data: Pick<TokenData, 'twitterAccessToken' | 'twitterAccessTokenSecret'> = {
    twitterAccessToken: '',
    twitterAccessTokenSecret: '',
  };
  const token = collection.doc(userId).update(data);

  await Promise.all([user, token]);
};
