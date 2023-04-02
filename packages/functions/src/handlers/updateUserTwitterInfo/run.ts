import { UserData } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import { setLastUsedSharedToken } from '../../modules/firestore/sharedToken';
import { getToken } from '../../modules/firestore/tokens/get';
import { updateUserTwitterInfo } from '../../modules/firestore/users/state';
import { convertTwitterUserToUserDataTwitter } from '../../modules/twitter-user-converter';
import { getClient } from '../../modules/twitter/client';
import { getMe } from '../../modules/twitter/users/me';
import { topicName, Message } from './_pubsub';

/** PubSub: Twitter 情報更新 個々の実行 */
export const run = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
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

    console.log(`⚙️ Starting update user document twitter info for [${uid}].`);

    const token = await getToken(uid);

    if (token === null) {
      console.error(`❗️[Error]: Failed to get token of [${uid}]: Token is not exists.`);
      return;
    }
    console.log(`⏳ Got watches and token from Firestore.`);

    const ownClient = getClient({
      accessToken: token.twitterAccessToken,
      accessSecret: token.twitterAccessTokenSecret,
    });
    const me = await getMe(ownClient);

    if ('error' in me) {
      console.error(`❗️[Error]: Failed to get user from Twitter of [${uid}].`);
      return;
    }
    console.log(`⏳ Got user info from Twitter.`);

    const twitter: UserData['twitter'] = convertTwitterUserToUserDataTwitter(me);
    await updateUserTwitterInfo(uid, twitter, now);
    await setLastUsedSharedToken(uid, ['v2_getUserMe'], now);

    console.log(`⏳ Updated user document twitter info of [${uid}].`);

    console.log(`✔️ Completed update user document twitter info for [${uid}].`);
  });
