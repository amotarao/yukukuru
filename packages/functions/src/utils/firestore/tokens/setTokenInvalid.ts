import { UserData, TokenData } from '@yukukuru/types';
import { firestore } from '../../../modules/firebase';

export const setTokenInvalid = async (userId: string): Promise<void> => {
  const userData: Pick<UserData, 'invalid'> = {
    invalid: true,
  };
  const tokenData: Pick<TokenData, 'twitterAccessToken' | 'twitterAccessTokenSecret'> = {
    twitterAccessToken: '',
    twitterAccessTokenSecret: '',
  };

  const user = firestore.collection('users').doc(userId).set(userData, { merge: true });
  const token = firestore.collection('tokens').doc(userId).set(tokenData, { merge: true });
  await Promise.all([user, token]);
};
