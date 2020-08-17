import { getFollowersIdsLoop } from '../../modules/twitter/users';
import { checkInvalidToken, checkProtectedUser } from '../../modules/twitter/error';
import { setTokenInvalid, getToken, setWatch, setUserResult, setUserResultWithNoChange } from '../../utils/firestore';
import { log, errorLog } from '../../utils/log';

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
    log('onCreateQueue', 'getFollowers', { type: 'no-token', uid });
    await setTokenInvalid(uid);
    return;
  }

  const result = await getFollowersIdsLoop<string>(
    {
      user_id: token.twitterId,
      cursor: nextCursor,
      stringify_ids: true, // Firestore ドキュメント データサイズ制限を考慮した数値
      count: 30000,
    },
    {
      access_token_key: token.twitterAccessToken,
      access_token_secret: token.twitterAccessTokenSecret,
    }
  );

  if (!result.success) {
    errorLog('onCreateQueue', 'getFollowers', { uid, errors: result.error });
    if (checkInvalidToken(result.error)) {
      await setTokenInvalid(uid);
    }
    if (checkProtectedUser(result.error)) {
      await setUserResultWithNoChange(uid, now);
      return;
    }
    return;
  }

  const { ids, next_cursor_str: newNextCursor } = result.data;
  const ended = newNextCursor === '0' || newNextCursor === '-1';
  const watchId = await setWatch(uid, ids, now, ended);
  await setUserResult(uid, watchId, newNextCursor, now);

  return {
    userId: uid,
    watchId,
    newNextCursor,
  };
};
