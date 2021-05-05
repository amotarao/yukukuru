import { TokenData } from '@yukukuru/types';
import { firestore } from '../firebase';

export const setToken = async (uid: string, token: TokenData): Promise<void> => {
  await firestore.collection('tokens').doc(uid).set(token, { merge: true });
};
