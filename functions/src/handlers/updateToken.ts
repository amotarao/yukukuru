import * as functions from 'firebase-functions';
import { firestore } from '../modules/firebase';
import { TokenData } from '../utils/interfaces';

type Props = TokenData;

function isObject(data: any): data is Object {
  return typeof data === 'object' && data !== null && !Array.isArray(data);
}

function isProps(data: any): data is Props {
  return (
    isObject(data) &&
    typeof data.twitterAccessToken === 'string' &&
    typeof data.twitterAccessTokenSecret === 'string' &&
    typeof data.twitterId === 'string' &&
    Object.keys(data).length === 3
  );
}

export async function updateTokenHandler(data: any, context: functions.https.CallableContext) {
  console.log('updateToken', data, context);

  if (!isProps(data) || typeof context.auth === 'undefined') {
    return false;
  }

  await firestore
    .collection('tokens')
    .doc(context.auth.uid)
    .set(data);

  return true;
}
