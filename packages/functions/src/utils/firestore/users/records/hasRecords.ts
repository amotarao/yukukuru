import { firestore } from '../../../../modules/firebase';

export const hasRecords = async (userId: string): Promise<boolean> => {
  const snapshot = await firestore.collection('users').doc(userId).collection('records').limit(1).get();
  return !snapshot.empty;
};
