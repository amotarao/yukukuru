import * as functions from 'firebase-functions';
import * as _ from 'lodash';
import * as Twitter from 'twitter';
import { setTwUsers, updateUserLastUpdatedTwUsers, getToken } from '../../../utils/firestore';
import { getUsersLookup } from '../../../utils/twitter';
import { getLatestWatches } from '../../../utils/firestore/watches/getWatches';

type Props = {
  uid: string;
};

export const updateTwUsers = async ({ uid }: Props, now: Date): Promise<void> => {
  const [watches, token] = await Promise.all([getLatestWatches({ uid, count: 5 }), getToken(uid)]);
  const followers = _.uniq(_.flatten((watches || []).map((doc) => doc.data.followers))).slice(0, 10000); // 10000人まで

  if (token === null) {
    // エラー
    console.error(JSON.stringify({ type: 'checkIntegrity: noToken', uid }));
    return;
  }

  const client = new Twitter({
    consumer_key: functions.config().twitter.consumer_key as string,
    consumer_secret: functions.config().twitter.consumer_secret as string,
    access_token_key: token.twitterAccessToken,
    access_token_secret: token.twitterAccessTokenSecret,
  });
  const result = await getUsersLookup(client, { usersId: followers });

  if ('errors' in result) {
    // エラー
    console.error(JSON.stringify({ type: 'checkIntegrity: usersLoopupError', uid }));
    return;
  }
  await setTwUsers(result.response);
  await updateUserLastUpdatedTwUsers(uid, now);

  console.log(JSON.stringify({ uid, type: 'success', lookuped: result.response.length, followers: followers.length }));
};
