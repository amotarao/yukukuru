import * as admin from 'firebase-admin';
import { firestore } from '../../modules/firebase';

const usersCollection = firestore.collection('users');

export default async (user: admin.auth.UserRecord) => {
  const { photoURL, displayName, uid } = user;

  await usersCollection.doc(uid).set(
    {
      photoUrl: photoURL,
      displayName,
      active: true,
      currentWatchesId: '',
      lastUpdated: new Date(),
      nextCursor: '-1',
      newUser: true,
    },
    { merge: true }
  );
  return;
};
