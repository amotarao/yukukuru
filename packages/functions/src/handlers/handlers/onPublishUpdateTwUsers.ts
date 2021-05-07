import { UpdateTwUsersMessage } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import * as _ from 'lodash';
import * as Twitter from 'twitter';
import { getToken } from '../../modules/firestore/tokens';
import { getLatestWatches } from '../../modules/firestore/watches/getWatches';
import { PubSubOnPublishHandler } from '../../types/functions';
import { setTwUsers, updateUserLastUpdatedTwUsers } from '../../utils/firestore';
import { getUsersLookup } from '../../utils/twitter';

type Props = UpdateTwUsersMessage['data'];

export const onPublishUpdateTwUsersHandler: PubSubOnPublishHandler = async (message, context) => {
  const { uid } = message.json as Props;
  const now = new Date(context.timestamp);

  console.log(`⚙️ Starting update twUser document for [${uid}].`);

  const [watches, token] = await Promise.all([getLatestWatches({ uid, count: 5 }), getToken(uid)]);
  const followers = _.uniq(_.flatten((watches || []).map((doc) => doc.data.followers))).slice(0, 10000); // 10000人まで

  if (token === null) {
    console.error(`❗️[Error]: Failed to get token of [${uid}]: Token is not exists.`);
    return;
  }

  console.log(`⏳ Got watches and token from Firestore.`);

  const client = new Twitter({
    consumer_key: functions.config().twitter.consumer_key as string,
    consumer_secret: functions.config().twitter.consumer_secret as string,
    access_token_key: token.twitterAccessToken,
    access_token_secret: token.twitterAccessTokenSecret,
  });
  const result = await getUsersLookup(client, { usersId: followers });

  console.log(`⏳ Got users from Twitter.`);

  if ('errors' in result) {
    console.error(`❗️[Error]: Failed to get users from Twitter of [${uid}].`, result.errors);
    return;
  }
  await setTwUsers(result.response);
  await updateUserLastUpdatedTwUsers(uid, now);

  console.log(`✔️ Completed update twUser document for [${uid}].`);
};
