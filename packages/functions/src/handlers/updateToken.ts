import { TokenData } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import { setToken } from '../utils/firestore/tokens/setToken';

type Props = TokenData;

function isObject(data: unknown): data is Record<string, any> {
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

export async function updateTokenHandler(data: unknown, context: functions.https.CallableContext): Promise<boolean> {
  console.log('updateToken', data, context);

  if (!isProps(data) || typeof context.auth === 'undefined') {
    return false;
  }

  await setToken(context.auth.uid, data);
  return true;
}
