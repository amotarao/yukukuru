import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: functions.config().storage.bucket as string,
});

const auth = admin.auth();
const firestore = admin.firestore();
const storage = admin.storage().bucket();

export { admin, auth, firestore, storage };
