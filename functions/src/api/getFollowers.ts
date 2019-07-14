import * as Twitter from 'twitter';
import { firestore } from '../modules/firebase';
import { env } from '../utils/env';

export default async () => {
  const now = new Date();

  const querySnapshot = await firestore
    .collection('users')
    .where('active', '==', true)
    .orderBy('lastUpdated')
    .orderBy('nextCursor')
    .limit(10)
    .get();

  const requests = querySnapshot.docs.map(async (snapshot) => {
    const { nextCursor, currentWatchesId } = snapshot.data();
    const tokenRef = await firestore
      .collection('tokens')
      .doc(snapshot.id)
      .get();
    const { twitterAccessToken, twitterAccessTokenSecret, twitterId } = tokenRef.data() as {
      twitterAccessToken: string;
      twitterAccessTokenSecret: string;
      twitterId: string;
    };

    if (!twitterAccessToken || !twitterAccessTokenSecret || !twitterId) {
      console.log(snapshot.id, 'no-token');
      return;
    }

    const client = new Twitter({
      consumer_key: env.twitter_api_key,
      consumer_secret: env.twitter_api_secret_key,
      access_token_key: twitterAccessToken,
      access_token_secret: twitterAccessTokenSecret,
    });

    const result = await client
      .get('followers/list', {
        userId: twitterId,
        cursor: nextCursor,
        count: 200,
        skip_status: true,
        include_user_entities: false,
      })
      .catch((error) => {
        return { error: true, message: error };
      });

    if ('error' in result) {
      console.error(snapshot.id, result.message);
      return;
    }

    const newFollowers = result.users.map(({ id_str }: { id_str: string }) => id_str);
    const newNextCursor = result.next_cursor_str;

    let id = '';

    if (currentWatchesId === '') {
      const ref = await snapshot.ref.collection('watches').add({
        followers: newFollowers,
        getStartDate: now,
        getEndDate: now,
      });
      id = ref.id;
    } else {
      const ref = await snapshot.ref.collection('watches').doc(currentWatchesId);
      const { followers } = (await ref.get()).data() as { followers: string[] };
      await ref.set(
        {
          followers: [...followers, ...newFollowers],
          getEndDate: now,
        },
        { merge: true }
      );
      id = ref.id;
    }

    if (newNextCursor === '0') {
      await snapshot.ref.set(
        {
          nextCursor: '-1',
          currentWatchesId: '',
          lastUpdated: now,
          newUser: false,
        },
        { merge: true }
      );
    } else {
      await snapshot.ref.set(
        {
          nextCursor: newNextCursor,
          currentWatchesId: id,
          lastUpdated: now,
          newUser: false,
        },
        { merge: true }
      );
    }

    return {
      users: result.users.map(({ id_str }: { id_str: string }) => id_str),
      nextCursor: result.next_cursor_str,
    };
  });

  const results = await Promise.all(requests);
  console.log(results);
};
