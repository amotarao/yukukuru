import * as admin from 'firebase-admin';
import { firestore } from '../../modules/firebase';

const usersCollection = firestore.collection('users');

export default async (user: admin.auth.UserRecord) => {
  const { photoURL, displayName, uid } = user;
  const now = new Date();

  await usersCollection.doc(uid).set(
    {
      photoUrl: photoURL,
      displayName,
      active: true,
      currentWatchesId: '',
      invalid: false,
      lastUpdated: now,
      lastUpdatedTwUsers: now,
      nextCursor: '-1',
      newUser: true,
      pausedGetFollower: false,
    },
    { merge: true }
  );
  return;
};
