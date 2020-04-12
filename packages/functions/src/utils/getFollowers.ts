import { FirestoreIdData, UserData } from '@yukukuru/types';
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

type Props = FirestoreIdData<UserData>;

interface Response {
  userId: string;
  watchId: string;
  newNextCursor: string;
}

export const getFollowers = async ({ id, data: { nextCursor } }: Props): Promise<Response | void> => {
  const token = await getToken(id);
  if (!token) {
    console.log(id, 'no-token');
    await setTokenInvalid(id);
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
    console.error(id, result);
    if (checkInvalidToken(result.errors)) {
      await setTokenInvalid(id);
    }
    if (checkProtectedUser(result.errors)) {
      await setUserResultWithNoChange(id, now);
      return;
    }
    return;
  }

  const { ids, next_cursor_str: newNextCursor } = result.response;
  const ended = newNextCursor === '0' || newNextCursor === '-1';
  const watchId = await setWatch(id, ids, now, ended);
  await setUserResult(id, watchId, newNextCursor, now);

  return {
    userId: id,
    watchId,
    newNextCursor,
  };
};
