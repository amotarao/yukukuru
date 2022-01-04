import { getAnalytics } from 'firebase/analytics';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const app = getApps().length
  ? getApp()
  : initializeApp({
      apiKey: process.env.NEXT_APP_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_APP_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_APP_FIREBASE_DATABASE_URL,
      projectId: process.env.NEXT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_APP_FIREBASE_APP_ID,
    });

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const analytics = getAnalytics(app);
