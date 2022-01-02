import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: functions.config().storage_bucket.default_bucket as string,
});

export const auth = admin.auth();
export const firestore = admin.firestore();
export const storage = admin.storage();
export const bucket = storage.bucket();
