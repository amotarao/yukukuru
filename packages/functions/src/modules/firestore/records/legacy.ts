import { firestore } from '../../firebase';

export const existsRecords = async (userId: string): Promise<boolean> => {
  const snapshot = await firestore.collection('users').doc(userId).collection('records').limit(1).get();
  return !snapshot.empty;
};
