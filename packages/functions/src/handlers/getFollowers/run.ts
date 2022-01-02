import * as dayjs from 'dayjs';
import * as functions from 'firebase-functions';
import { getStripeRole } from '../../modules/auth/claim';
import { getToken } from '../../modules/firestore/tokens/get';
import { setTokenInvalid } from '../../modules/firestore/tokens/set';
import { setUserResult } from '../../modules/firestore/users/state';
import { setWatch } from '../../modules/firestore/watches/setWatch';
import { getClient } from '../../modules/twitter/client';
import { checkInvalidToken } from '../../modules/twitter/error';
import { getFollowersIds } from '../../modules/twitter/followers/ids';
import { topicName, Message } from './_pubsub';

/** PubSub: フォロワー取得 個々の実行 */
export const run = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 20,
    memory: '256MB',
  })
  .pubsub.topic(topicName)
  .onPublish(async (message, context) => {
    const { uid, nextCursor, lastRun, publishedAt } = message.json as Message;
    const now = new Date(context.timestamp);

    // 10秒以内の実行に限る
    if (now.getTime() - new Date(publishedAt).getTime() > 1000 * 10) {
      console.error(`❗️[Error]: Failed to run functions: published more than 10 seconds ago.`);
      return;
    }

    // cursor が -1 のとき、サポーター以外は 1時間未満の実行間隔の場合は終了
    if (nextCursor === '-1') {
      const role = await getStripeRole(uid);
      if (role === null) {
        const minutes = dayjs(publishedAt).diff(dayjs(lastRun), 'minutes');

        // サポーター以外かつ1時間未満なので終了
        if (minutes < 59) {
          console.log(`[Info]: Stopped get followers for [${uid}] due to basic user.`);
          return;
        }
      } else {
        console.log(`[Info]: [${uid}] is ${role}!`);
      }
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
  });
