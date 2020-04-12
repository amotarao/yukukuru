import { UserData } from '@yukukuru/types';
import * as Twitter from 'twitter';
import { env } from './env';
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

interface Response {
  userId: string;
  watchId: string;
  newNextCursor: string;
}

export const getFollowers = async (
  snapshot: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>
): Promise<Response | void> => {
  const { nextCursor } = snapshot.data() as UserData;

  const token = await getToken(snapshot.id);
  if (!token) {
    console.log(snapshot.id, 'no-token');
    await setTokenInvalid(snapshot.id);
    return;
  }
  const { twitterAccessToken, twitterAccessTokenSecret, twitterId } = token;

  const client = new Twitter({
    consumer_key: env.twitter_api_key,
    consumer_secret: env.twitter_api_secret_key,
    access_token_key: twitterAccessToken,
    access_token_secret: twitterAccessTokenSecret,
  });

  const result = await getFollowersIdList(client, {
    userId: twitterId,
    cursor: nextCursor,
    count: 10000, // Firestore ドキュメント データサイズ制限を考慮した数値
  });

  if ('errors' in result) {
    console.error(snapshot.id, result);
    if (checkInvalidToken(result.errors)) {
      await setTokenInvalid(snapshot.id);
    }
    if (checkProtectedUser(result.errors)) {
      await setUserResultWithNoChange(snapshot.id, now);
      return;
    }
    return;
  }

  const { ids, next_cursor_str: newNextCursor } = result.response;
  const ended = newNextCursor === '0' || newNextCursor === '-1';
  const watchId = await setWatch(snapshot.id, ids, now, ended);
  await setUserResult(snapshot.id, watchId, newNextCursor, now);

  return {
    userId: snapshot.id,
    watchId,
    newNextCursor,
  };
};
