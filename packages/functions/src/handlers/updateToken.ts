import { TokenData } from '@yukukuru/types';
import { firestore } from '../modules/firebase';
import { HttpsOnCallHandler } from '../types/functions';
import { log } from '../utils/log';

type Props = TokenData;

function isObject(data: any): data is Record<string, any> {
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

export const updateTokenHandler: HttpsOnCallHandler = async (data, context) => {
  log('updateToken', '', { data, context });

  if (!isProps(data) || typeof context.auth === 'undefined') {
    return false;
  }

  await firestore.collection('tokens').doc(context.auth.uid).set(data);

  return true;
};
