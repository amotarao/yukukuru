import * as functions from 'firebase-functions';
import { auth } from '../../modules/firebase';
import { initializeUser } from '../../modules/firestore/users/initialize';
import { convertTwitterUserToUserDataTwitter } from '../../modules/twitter-user-converter';
import { getAppClient } from '../../modules/twitter/client';
import { getUsers } from '../../modules/twitter/api/users';

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
    const response = await getUsers(appClient, [twitterId]);

    if ('error' in response || !response.users[0]) {
      await auth.deleteUser(uid);
      console.error(`❗️[Error]: Failed to initialize user for [${uid}]: Cannot get user from Twitter.`);
      return;
    }

    await initializeUser(uid, convertTwitterUserToUserDataTwitter(response.users[0]));

    console.log(`✔️ Completed initialize user document for [${uid}].`);
  });
