import { TokenData } from '@yukukuru/types';
import { firestore } from '../../firebase';
import { setUserToNotActive } from '../users/active';

export const setTokenInvalid = async (userId: string): Promise<void> => {
  const user = setUserToNotActive(userId);
  const data: Pick<TokenData, 'twitterAccessToken' | 'twitterAccessTokenSecret'> = {
    twitterAccessToken: '',
    twitterAccessTokenSecret: '',
  };
  const token = firestore.collection('tokens').doc(userId).update(data);

  await Promise.all([user, token]);
};
