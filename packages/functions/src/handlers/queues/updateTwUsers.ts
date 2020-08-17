import * as _ from 'lodash';
import { getUsersLookup } from '../../modules/twitter/users';
import { setTwUsers, updateUserLastUpdatedTwUsers, getToken } from '../../utils/firestore';
import { getLatestWatches } from '../../utils/firestore/watches/getWatches';
import { log, errorLog } from '../../utils/log';

type Props = {
  uid: string;
};

export const updateTwUsers = async ({ uid }: Props, now: Date): Promise<void> => {
  const [watches, token] = await Promise.all([getLatestWatches({ uid, count: 5 }), getToken(uid)]);
  const followers = _.uniq(_.flatten((watches || []).map((doc) => doc.data.followers))).slice(0, 10000); // 10000人まで

  if (token === null) {
    // エラー
    errorLog('onCreateQueue', 'updateTwUsers', { uid, type: 'noToken' });
    return;
  }

  const result = await getUsersLookup(
    { user_id: followers.join(',') },
    {
      access_token_key: token.twitterAccessToken,
      access_token_secret: token.twitterAccessTokenSecret,
    }
  );

  if (!result.success) {
    // エラー
    errorLog('onCreateQueue', 'updateTwUsers', { uid, type: 'usersLoopupError' });
    return;
  }
  await setTwUsers(result.data);
  await updateUserLastUpdatedTwUsers(uid, now);

  log('onCreateQueue', 'updateTwUsers', {
    uid,
    type: 'success',
    lookuped: result.data.length,
    followers: followers.length,
  });
};
