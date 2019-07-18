import * as Twitter from 'twitter';
import { firestore } from '../modules/firebase';
import { env } from '../utils/env';
import { checkInvalidToken, setTokenInvalid, getToken, setWatch, setUserResult, checkProtectedUser, setUserResultWithNoChange } from '../utils/firestore';
import { UserData } from '../utils/interfaces';
import { getFollowersList } from '../utils/twitter';

export default async () => {
  const now = new Date();
  const time18 = new Date();
  // Twitter API は 15分制限があるが、余裕を持って 18分にした
  time18.setMinutes(now.getMinutes() - 18);

  const allUsers = firestore
    .collection('users')
    .where('active', '==', true)
    .where('invalid', '==', false)
    .where('lastUpdated', '<', time18)
    .orderBy('lastUpdated')
    .limit(30)
    .get();

  const pausedUsers = firestore
    .collection('users')
    .where('active', '==', true)
    .where('invalid', '==', false)
    .where('pausedGetFollower', '==', true)
    .where('lastUpdated', '<', time18)
    .orderBy('lastUpdated')
    .limit(10)
    .get();

  const [allUsersSnap, pausedUsersSnap] = await Promise.all([allUsers, pausedUsers]);
  const docs = [...allUsersSnap.docs, ...pausedUsersSnap.docs].filter((x, i, self) => self.findIndex((y) => x.id === y.id) === i);
  console.log(docs.map((doc) => doc.id), docs.length);

  const requests = docs.map(async (snapshot) => {
    const { nextCursor, currentWatchesId } = snapshot.data() as UserData;

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

    const result = await getFollowersList(client, {
      userId: twitterId,
      cursor: nextCursor,
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

    const followers = result.response.users.map(({ id_str }) => id_str);
    const newNextCursor = result.response.next_cursor_str;

    const watchId = await setWatch(snapshot.id, followers, now, currentWatchesId);
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
