import { UpdateUserTwitterInfoMessage, UserData } from '@yukukuru/types';
import { getToken } from '../modules/firestore/tokens';
import { updateUserTwitterInfo } from '../modules/firestore/users/state';
import { getAccountVerifyCredentials } from '../modules/twitter/account/verifyCredentials';
import { getClient } from '../modules/twitter/client';
import { PubSubOnPublishHandler } from '../types/functions';

type Props = UpdateUserTwitterInfoMessage['data'];

export const runUpdateUserTwitterInfoHandler: PubSubOnPublishHandler = async (message, context) => {
  const { uid } = message.json as Props;
  const now = new Date(context.timestamp);

  console.log(`⚙️ Starting update user document twitter info for [${uid}].`);

  const token = await getToken(uid);

  if (token === null) {
    console.error(`❗️[Error]: Failed to get token of [${uid}]: Token is not exists.`);
    return;
  }
  console.log(`⏳ Got watches and token from Firestore.`);

  const client = getClient({
    access_token_key: token.twitterAccessToken,
    access_token_secret: token.twitterAccessTokenSecret,
  });
  const result = await getAccountVerifyCredentials(client);

  if ('errors' in result) {
    console.error(`❗️[Error]: Failed to get user from Twitter of [${uid}].`, result.errors);
    return;
  }
  console.log(`⏳ Got user info from Twitter.`);

  const twitter: UserData['twitter'] = {
    id: result.response.id_str,
    screenName: result.response.screen_name,
    name: result.response.name,
    photoUrl: result.response.profile_image_url_https,
    followersCount: result.response.followers_count,
    verified: result.response.verified,
  };

  await updateUserTwitterInfo(uid, twitter, now);

  console.log(`⏳ Updated user document twitter info of [${uid}].`);

  console.log(`✔️ Completed update user document twitter info for [${uid}].`);
};
