import { TokenData } from '@yukukuru/types';
import { firestore } from '../../firebase';

export const getToken = async (userId: string): Promise<TokenData | null> => {
  const tokenRef = firestore.collection('tokens').doc(userId);
  const tokenDoc = await tokenRef.get();
  if (!tokenDoc.exists) {
    return null;
  }
  const { twitterAccessToken = null, twitterAccessTokenSecret = null } = tokenDoc.data() as TokenData;
  const invalid = !twitterAccessToken || !twitterAccessTokenSecret;
  if (invalid) {
    return null;
  }
  return { twitterAccessToken, twitterAccessTokenSecret };
};
