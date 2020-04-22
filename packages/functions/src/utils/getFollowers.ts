import * as functions from 'firebase-functions';
import * as Twitter from 'twitter';
import {
  checkInvalidToken,
  setTokenInvalid,
  getToken,
  setWatch,
  setUserResult,
  checkProtectedUser,
  setUserResultWithNoChange,
} from './firestore';
import { getFollowersIdList } from './twitter';

type Props = {
  uid: string;
  nextCursor: string;
};

interface Response {
  userId: string;
  watchId: string;
  newNextCursor: string;
}

export const getFollowers = async ({ uid, nextCursor }: Props, now: Date): Promise<Response | void> => {
  const token = await getToken(uid);
  if (!token) {
    console.log(uid, 'no-token');
    await setTokenInvalid(uid);
    return;
  }
  const { twitterAccessToken, twitterAccessTokenSecret, twitterId } = token;

  const client = new Twitter({
    consumer_key: functions.config().twitter.consumer_key as string,
    consumer_secret: functions.config().twitter.consumer_secret as string,
    access_token_key: twitterAccessToken,
    access_token_secret: twitterAccessTokenSecret,
  });

  const result = await getFollowersIdList(client, {
    userId: twitterId,
    cursor: nextCursor,
    count: 30000, // Firestore ドキュメント データサイズ制限を考慮した数値
  });

  if ('errors' in result) {
    console.error(uid, result);
    if (checkInvalidToken(result.errors)) {
      await setTokenInvalid(uid);
    }
    if (checkProtectedUser(result.errors)) {
      await setUserResultWithNoChange(uid, now);
      return;
    }
    return;
  }

  const { ids, next_cursor_str: newNextCursor } = result.response;
  const ended = newNextCursor === '0' || newNextCursor === '-1';
  const watchId = await setWatch(uid, ids, now, ended);
  await setUserResult(uid, watchId, newNextCursor, now);

  return {
    userId: uid,
    watchId,
    newNextCursor,
  };
};
