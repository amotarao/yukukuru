import { TokenData } from '@yukukuru/types';
import { firestore } from '../../../modules/firebase';

const collection = firestore.collection('tokens');

export const setToken = async (userId: string, token: TokenData): Promise<void> => {
  await collection.doc(userId).set(token, { merge: true });
};
