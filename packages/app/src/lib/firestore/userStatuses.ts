import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { firestore } from '../firebase';

export const setLastViewing = async (uid: string): Promise<void> => {
  const ref = doc(firestore, 'userStatuses', uid);
  await setDoc(ref, { lastViewing: serverTimestamp() }, { merge: true });
};
