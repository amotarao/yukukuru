import { GetFollowersMessage } from '@yukukuru/types';
import { getToken, setTokenInvalid } from '../modules/firestore/tokens';
import { setUserResult } from '../modules/firestore/users/state';
import { setWatch } from '../modules/firestore/watches/setWatch';
import { getClient } from '../modules/twitter/client';
import { checkInvalidToken } from '../modules/twitter/error';
import { getFollowersIds } from '../modules/twitter/followers/ids';
import { PubSubOnPublishHandler } from '../types/functions';

export const runGetFollowersHandler: PubSubOnPublishHandler = async (message, context) => {
  const { uid, nextCursor, publishedAt } = message.json as GetFollowersMessage['data'];
  const now = new Date(context.timestamp);

  // 10秒以内の実行に限る
  if (now.getTime() - new Date(publishedAt).getTime() > 1000 * 10) {
    console.error(`❗️[Error]: Failed to run functions: published more than 10 seconds ago.`);
    return;
  }

  console.log(`⚙️ Starting get followers for [${uid}].`);

  const token = await getToken(uid);
  if (token === null) {
    console.error(`❗️[Error]: Failed to get token of [${uid}]: Token is not exists.`);
    return;
  }
  console.log(`⏳ Got token from Firestore.`);

  const { twitterAccessToken, twitterAccessTokenSecret, twitterId } = token;
  const client = getClient({
    access_token_key: twitterAccessToken,
    access_token_secret: twitterAccessTokenSecret,
  });
  const result = await getFollowersIds(client, {
    userId: twitterId,
    cursor: nextCursor,
    count: 30000, // Firestore ドキュメント データサイズ制限を考慮した数値
  });

  if ('errors' in result) {
    console.error(`❗️[Error]: Failed to get users from Twitter of [${uid}].`, result.errors);

    if (checkInvalidToken(result.errors)) {
      await setTokenInvalid(uid);
    }
    return;
  }
  console.log(`⏳ Got ${result.response.ids.length} users from Twitter.`);

  const { ids, next_cursor_str: newNextCursor } = result.response;
  const ended = newNextCursor === '0' || newNextCursor === '-1';
  const watchId = await setWatch(uid, ids, now, ended);
  await setUserResult(uid, watchId, ended, newNextCursor, now);

  console.log(`⏳ Updated state to user document of [${uid}].`);

  console.log(`✔️ Completed get followers for [${uid}].`);
};
