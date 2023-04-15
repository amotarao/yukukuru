import * as functions from 'firebase-functions';
import { auth } from '../../modules/firebase';
import { initializeUser } from '../../modules/firestore/users/initialize';
import { convertTwitterUserToUserTwitter } from '../../modules/twitter-user-converter';
import { getUser } from '../../modules/twitter/api/users';
import { getAppClient } from '../../modules/twitter/client';

/** Auth: ユーザーが作成されたときの処理 */
export const initialize = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .auth.user()
  .onCreate(async (user) => {
    const uid = user.uid;

    console.log(`⚙️ Initializing user document for [${uid}]`);

    const twitterId = user.providerData.find((provider) => provider.providerId === 'twitter.com')?.uid ?? null;

    if (!twitterId) {
      await auth.deleteUser(uid);
      console.error(`❗️[Error]: Failed to initialize user for [${uid}]: Cannot get twitter id.`);
      return;
    }

    const appClient = getAppClient();
    const response = await getUser(appClient, twitterId);

    if ('error' in response || 'errorUser' in response) {
      await auth.deleteUser(uid);
      console.error(`❗️[Error]: Failed to initialize user for [${uid}]: Cannot get user from Twitter.`);
      return;
    }

    await initializeUser(uid, convertTwitterUserToUserTwitter(response.user));

    console.log(`✔️ Completed initialize user document for [${uid}].`);
  });
