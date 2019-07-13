import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

export const auth = admin.auth();
export const firestore = admin.firestore();
