import { TokenData } from '@yukukuru/types';
import { firestore } from '../modules/firebase';
import { HttpsOnCallHandler } from '../types/functions';
import { log } from '../utils/log';

type Props = TokenData;

function isObject(data: unknown): data is Record<string, unknown> {
  return typeof data === 'object' && data !== null && !Array.isArray(data);
}

function isProps(data: unknown): data is Props {
  return (
    isObject(data) &&
    typeof data.twitterAccessToken === 'string' &&
    typeof data.twitterAccessTokenSecret === 'string' &&
    typeof data.twitterId === 'string' &&
    Object.keys(data).length === 3
  );
}

export const updateTokenHandler: HttpsOnCallHandler = async (data, context) => {
  log('updateToken', '', { data });

  if (!isProps(data) || typeof context.auth === 'undefined') {
    return false;
  }

  await firestore.collection('tokens').doc(context.auth.uid).set(data);

  return true;
};
