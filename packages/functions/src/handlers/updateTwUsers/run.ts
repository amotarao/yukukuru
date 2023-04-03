import * as functions from 'firebase-functions';
import * as _ from 'lodash';
import { getToken } from '../../modules/firestore/tokens/get';
import { setTwUsers } from '../../modules/firestore/twUsers';
import { updateUserLastUpdatedTwUsers } from '../../modules/firestore/users/state';
import { getLatestWatches } from '../../modules/firestore/watches/getWatches';
import { getClient } from '../../modules/twitter/client';
import { getUsers } from '../../modules/twitter/users/lookup';
import { topicName, Message } from './_pubsub';

/** PubSub: Twitter ユーザー情報更新 個々の実行 */
export const run = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB',
  })
  .pubsub.topic(topicName)
  .onPublish(async (message, context) => {
    const { uid, publishedAt } = message.json as Message;
    const now = new Date(context.timestamp);

    // 10秒以内の実行に限る
    if (now.getTime() - new Date(publishedAt).getTime() > 1000 * 10) {
      console.error(`❗️[Error]: Failed to run functions: published more than 10 seconds ago.`);
      return;
    }

    console.log(`⚙️ Starting update twUser documents for [${uid}].`);

    const [watches, token] = await Promise.all([getLatestWatches(uid, 5), getToken(uid)]);
    const followers = _.uniq(_.flatten((watches || []).map((doc) => doc.data().followers))).slice(0, 10000); // 10000人まで

    if (token === null) {
      console.error(`❗️[Error]: Failed to get token of [${uid}]: Token is not exists.`);
      return;
    }

    console.log(`⏳ Got watches and token from Firestore.`);

    const client = getClient({
      accessToken: token.twitterAccessToken,
      accessSecret: token.twitterAccessTokenSecret,
    });
    const response = await getUsers(client, followers);

    if ('error' in response) {
      console.error(`❗️[Error]: Failed to get users from Twitter of [${uid}].`);
      return;
    }
    console.log(`⏳ Got ${response.users.length} users from Twitter.`);

    await setTwUsers(response.users);

    console.log(`⏳ Updated twUser documents for [${uid}].`);

    await updateUserLastUpdatedTwUsers(uid, now);

    console.log(`⏳ Updated last updated to user document of [${uid}].`);

    console.log(`✔️ Completed update twUser documents for [${uid}].`);
  });
