import { TokenData } from '@yukukuru/types';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../firebase';

export const setToken = async (uid: string, token: TokenData): Promise<void> => {
  const ref = doc(firestore, 'tokens', uid);
  await setDoc(ref, token, { merge: true });
};
