import { TokenData } from '@yukukuru/types';
import { firestore } from '../../../modules/firebase';

const collection = firestore.collection('tokens');

export const getTokens = async (ids: string[]): Promise<(TokenData | null)[]> => {
  const refs = ids.map((id) => collection.doc(id));
  const fieldMask: (keyof TokenData)[] = ['twitterAccessToken', 'twitterAccessTokenSecret', 'twitterId'];
  const options: FirebaseFirestore.ReadOptions = { fieldMask };
  const docs = await firestore.getAll(...refs, options);

  return docs.map((doc) => {
    if (!doc.exists) {
      return null;
    }
    const { twitterAccessToken = null, twitterAccessTokenSecret = null, twitterId = null } = doc.data() as TokenData;
    if (!twitterAccessToken || !twitterAccessTokenSecret || !twitterId) {
      return null;
    }
    return { twitterAccessToken, twitterAccessTokenSecret, twitterId };
  });
};
