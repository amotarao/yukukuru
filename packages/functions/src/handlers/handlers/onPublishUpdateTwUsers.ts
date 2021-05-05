import { UpdateTwUsersMessage } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import * as _ from 'lodash';
import * as Twitter from 'twitter';
import { setTwUsers, updateUserLastUpdatedTwUsers, getToken } from '../../utils/firestore';
import { getUsersLookup } from '../../utils/twitter';
import { getLatestWatches } from '../../utils/firestore/watches/getWatches';
import { log, errorLog } from '../../utils/log';
import { PubSubOnPublishHandler } from '../../types/functions';

type Props = UpdateTwUsersMessage['data'];

export const onPublishUpdateTwUsersHandler: PubSubOnPublishHandler = async (message, context) => {
  const { uid } = message.json as Props;
  const now = new Date(context.timestamp);

  const [watches, token] = await Promise.all([getLatestWatches({ uid, count: 5 }), getToken(uid)]);
  const followers = _.uniq(_.flatten((watches || []).map((doc) => doc.data.followers))).slice(0, 10000); // 10000人まで

  if (token === null) {
    // エラー
    errorLog('onPublishUpdateTwUsers', 'updateTwUsers', { uid, type: 'noToken' });
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
    errorLog('onPublishUpdateTwUsers', 'updateTwUsers', { uid, type: 'usersLoopupError' });
    return;
  }
  await setTwUsers(result.response);
  await updateUserLastUpdatedTwUsers(uid, now);

  log('onPublishUpdateTwUsers', 'updateTwUsers', {
    uid,
    type: 'success',
    lookuped: result.response.length,
    followers: followers.length,
  });
};
