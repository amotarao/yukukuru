/* eslint-disable @typescript-eslint/camelcase */

import { WatchData } from '@yukukuru/types';
import * as Twitter from 'twitter';
import { firestore } from '../modules/firebase';
import { env } from '../utils/env';
import { setTwUsers, updateUserLastUpdatedTwUsers } from '../utils/firestore';
import { getUsersLookup } from '../utils/twitter';

export default async (): Promise<void> => {
  const now = new Date();
  const time1week = new Date();
  time1week.setDate(now.getDate() - 7);

  const querySnapshot = await firestore
    .collection('users')
    .where('active', '==', true)
    .where('invalid', '==', false)
    .where('newUser', '==', false)
    .where('lastUpdatedTwUsers', '<', time1week)
    .orderBy('lastUpdatedTwUsers')
    .limit(50)
    .get();

  const usersId: string[] = [];
  const requests = querySnapshot.docs.map(async (snapshot) => {
    const watch = await snapshot.ref.collection('watches').orderBy('getEndDate').limit(1).get();
    if (watch.size !== 1) {
      return '';
    }

    const { followers } = watch.docs[0].data() as WatchData;
    // API 制限ギリギリまで
    if (usersId.length + followers.length > 30000) {
      return '';
    }
    usersId.push(...followers);
    return snapshot.id;
  });
  const willUpdatedUsers = (await Promise.all(requests)).filter((e) => e !== '');

  const client = new Twitter({
    consumer_key: env.twitter_api_key,
    consumer_secret: env.twitter_api_secret_key,
    access_token_key: env.twitter_access_token_key,
    access_token_secret: env.twitter_access_token_secret,
  });
  const result = await getUsersLookup(client, { usersId });

  if ('errors' in result) {
    console.error(result);
    return;
  }
  await setTwUsers(result.response);

  const setDocsRequest = willUpdatedUsers.map((userId) => {
    return updateUserLastUpdatedTwUsers(userId, now);
  });
  await Promise.all(setDocsRequest);

  console.log(usersId.length, result.response.length, willUpdatedUsers);
};
