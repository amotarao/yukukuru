import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const auth = admin.auth();
const firestore = admin.firestore();

export { admin, auth, firestore };
