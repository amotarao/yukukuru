import * as functions from 'firebase-functions';
import { auth } from '../../modules/firebase';
import { initializeUser } from '../../modules/firestore/users/initialize';
import { getClient } from '../../modules/twitter/client';
import { getUsersLookup } from '../../modules/twitter/users/lookup';

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

    const client = getClient();
    const result = await getUsersLookup(client, { usersId: [twitterId] });

    if ('errors' in result || result.response.length !== 1) {
      await auth.deleteUser(uid);
      console.error(`❗️[Error]: Failed to initialize user for [${uid}]: Cannot get user from Twitter.`);
      return;
    }

    const twitter = result.response[0];
    const followersCount = twitter.followers_count;

    // フォロワー 10,000人以上で作成キャンセル (一時的)
    if (followersCount >= 10000) {
      await auth.deleteUser(uid);
      console.error(`❗️[Error]: Failed to initialize user for [${uid}]: Over 10,000 followers.`);
      return;
    }

    await initializeUser(uid, {
      id: twitter.id_str,
      screenName: twitter.screen_name,
      name: twitter.name,
      photoUrl: twitter.profile_image_url_https,
      followersCount: twitter.followers_count,
      verified: twitter.verified,
    });

    console.log(`✔️ Completed initialize user document for [${uid}].`);
  });
