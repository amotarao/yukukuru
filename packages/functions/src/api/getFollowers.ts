import { UserData } from '@yukukuru/types';
import * as Twitter from 'twitter';
import { firestore } from '../modules/firebase';
import { env } from '../utils/env';
import {
  checkInvalidToken,
  setTokenInvalid,
  getToken,
  setWatch,
  setUserResult,
  checkProtectedUser,
  setUserResultWithNoChange,
} from '../utils/firestore';
import { getFollowersIdList } from '../utils/twitter';

export default async () => {
  const now = new Date();
  // API は 15分で 75000人 の取得制限がある
  // 1回で 10000人 まで取れるので、2.5分間隔
  // 余裕を見て 3分間隔
  const time3 = new Date();
  time3.setMinutes(now.getMinutes() - 3);

  const time15 = new Date();
  time15.setMinutes(now.getMinutes() - 15);

  const allUsers = firestore
    .collection('users')
    .where('active', '==', true)
    .where('invalid', '==', false)
    .where('lastUpdated', '<', time15)
    .orderBy('lastUpdated')
    .limit(100)
    .get();

  const pausedUsers = firestore
    .collection('users')
    .where('active', '==', true)
    .where('invalid', '==', false)
    .where('pausedGetFollower', '==', true)
    .where('lastUpdated', '<', time3)
    .orderBy('lastUpdated')
    .limit(10)
    .get();

  const newUsers = firestore
    .collection('users')
    .where('active', '==', true)
    .where('invalid', '==', false)
    .where('newUser', '==', true)
    .limit(10)
    .get();

  const [allUsersSnap, pausedUsersSnap, newUsersSnap] = await Promise.all([allUsers, pausedUsers, newUsers]);
  const docs = [...allUsersSnap.docs, ...pausedUsersSnap.docs, ...newUsersSnap.docs].filter(
    (x, i, self) => self.findIndex((y) => x.id === y.id) === i
  );
  console.log(
    docs.map((doc) => doc.id),
    docs.length
  );

  const requests = docs.map(async (snapshot) => {
    const { nextCursor } = snapshot.data() as UserData;

    const token = await getToken(snapshot.id);
    if (!token) {
      console.log(snapshot.id, 'no-token');
      await setTokenInvalid(snapshot.id);
      return;
    }
    const { twitterAccessToken, twitterAccessTokenSecret, twitterId } = token;

    const client = new Twitter({
      consumer_key: env.twitter_api_key,
      consumer_secret: env.twitter_api_secret_key,
      access_token_key: twitterAccessToken,
      access_token_secret: twitterAccessTokenSecret,
    });

    const result = await getFollowersIdList(client, {
      userId: twitterId,
      cursor: nextCursor,
      count: 10000, // Firestore ドキュメント データサイズ制限を考慮した数値
    });

    if ('errors' in result) {
      console.error(snapshot.id, result);
      if (checkInvalidToken(result.errors)) {
        await setTokenInvalid(snapshot.id);
      }
      if (checkProtectedUser(result.errors)) {
        await setUserResultWithNoChange(snapshot.id, now);
        return;
      }
      return;
    }

    const { ids, next_cursor_str: newNextCursor } = result.response;
    const ended = newNextCursor === '0' || newNextCursor === '-1';
    const watchId = await setWatch(snapshot.id, ids, now, ended);
    await setUserResult(snapshot.id, watchId, newNextCursor, now);

    return {
      userId: snapshot.id,
      watchId,
      newNextCursor,
    };
  });

  const results = await Promise.all(requests);
  console.log(results);
};
