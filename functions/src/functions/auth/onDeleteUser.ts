import * as admin from 'firebase-admin';
import { firestore } from '../../modules/firebase';

const usersCollection = firestore.collection('users');

export default async ({ uid }: admin.auth.UserRecord) => {
  await usersCollection.doc(uid).set(
    {
      active: false,
    },
    { merge: true }
  );
  return;
};
