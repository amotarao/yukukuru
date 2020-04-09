import { TokenData } from '@yukukuru/types';
import { firestore } from '../../../modules/firebase';

const collection = firestore.collection('tokens');

export const getToken = async (userId: string): Promise<TokenData | null> => {
  const doc = await collection.doc(userId).get();
  if (!doc.exists) {
    return null;
  }
  const { twitterAccessToken = null, twitterAccessTokenSecret = null, twitterId = null } = doc.data() as TokenData;
  if (!twitterAccessToken || !twitterAccessTokenSecret || !twitterId) {
    return null;
  }
  return { twitterAccessToken, twitterAccessTokenSecret, twitterId };
};
