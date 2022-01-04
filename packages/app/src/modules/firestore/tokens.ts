import { TokenData } from '@yukukuru/types';
import { TwitterAuthProvider } from 'firebase/auth';
import { UserCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../firebase';

export const setToken = async (userCredential?: UserCredential): Promise<void> => {
  if (!userCredential) {
    return;
  }

  const { user } = userCredential;
  const credential = TwitterAuthProvider.credentialFromResult(userCredential);

  if (!credential) {
    return;
  }

  const token: TokenData = {
    twitterAccessToken: credential.accessToken || '',
    twitterAccessTokenSecret: credential.secret || '',
  };
  const docRef = doc(firestore, 'tokens', user.uid);
  await setDoc(docRef, token);
};
