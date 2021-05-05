import firebase from 'firebase/app';
import { firestore } from '../../modules/firebase';

export const setLastViewing = async (uid: string): Promise<void> => {
  const doc = firestore.collection('userStatuses').doc(uid);
  await doc.set({ lastViewing: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
};
