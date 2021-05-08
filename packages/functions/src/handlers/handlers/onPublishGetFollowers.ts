import { GetFollowersMessage } from '@yukukuru/types';
import { getToken, setTokenInvalid } from '../../modules/firestore/tokens';
import { setUserResult } from '../../modules/firestore/users/state';
import { setWatch } from '../../modules/firestore/watches/setWatch';
import { getClient } from '../../modules/twitter/client';
import { checkInvalidToken } from '../../modules/twitter/error';
import { getFollowersIdList } from '../../modules/twitter/followers/ids';
import { PubSubOnPublishHandler } from '../../types/functions';
import { log, errorLog } from '../../utils/log';

type Props = GetFollowersMessage['data'];

export const onPublishGetFollowersHandler: PubSubOnPublishHandler = async (message, context) => {
  const { uid, nextCursor } = message.json as Props;
  const now = new Date(context.timestamp);

  const token = await getToken(uid);
  if (!token) {
    log('onPublishGetFollowers', 'getFollowers', { type: 'no-token', uid });
    await setTokenInvalid(uid);
    return;
  }
  const { twitterAccessToken, twitterAccessTokenSecret, twitterId } = token;

  const client = getClient({
    access_token_key: twitterAccessToken,
    access_token_secret: twitterAccessTokenSecret,
  });
  const result = await getFollowersIdList(client, {
    userId: twitterId,
    cursor: nextCursor,
    count: 30000, // Firestore ドキュメント データサイズ制限を考慮した数値
  });

  if ('errors' in result) {
    errorLog('onPublishGetFollowers', 'getFollowers', { uid, errors: result.errors });
    if (checkInvalidToken(result.errors)) {
      await setTokenInvalid(uid);
    }
    return;
  }

  const { ids, next_cursor_str: newNextCursor } = result.response;
  const ended = newNextCursor === '0' || newNextCursor === '-1';
  const watchId = await setWatch(uid, ids, now, ended);
  await setUserResult(uid, watchId, ended, newNextCursor, now);
};
