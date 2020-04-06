import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore/memory';
import 'firebase/functions';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
});

export const provider = new firebase.auth.TwitterAuthProvider();
provider.setCustomParameters({
  lang: 'ja',
});

export default firebase;
export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const functions = firebase.app().functions('asia-northeast1');
