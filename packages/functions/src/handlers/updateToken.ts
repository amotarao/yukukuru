import { TokenData } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import { firestore } from '../modules/firebase';

function isObject(data): data is Record<string> {
  return typeof data === 'object' && data !== null && !Array.isArray(data);
}

function isTokenData(data): data is TokenData {
  return (
    isObject(data) &&
    typeof data.twitterAccessToken === 'string' &&
    typeof data.twitterAccessTokenSecret === 'string' &&
    typeof data.twitterId === 'string' &&
    Object.keys(data).length === 3
  );
}

export async function updateTokenHandler(data, context: functions.https.CallableContext): boolean {
  console.log('updateToken', data, context);

  if (!isTokenData(data) || typeof context.auth === 'undefined') {
    return false;
  }

  await firestore.collection('tokens').doc(context.auth.uid).set(data);

  return true;
}
