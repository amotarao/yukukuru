import * as functions from 'firebase-functions';
import * as Twitter from 'twitter';
import * as _ from 'lodash';
import { env } from '../../utils/env';

interface UserData {
  id: string;
  currentWatchesId: string;
  lastUpdated: FirebaseFirestore.Timestamp | null;
  nextCursor: string;
  newUser: boolean;
  twitterAccessToken: string;
  twitterAccessTokenSecret: string;
}

export default async ({ after, before }: functions.Change<FirebaseFirestore.DocumentSnapshot>) => {
  const afterData = after.data() as UserData;
  const beforeData = before.data() as UserData;

  if (afterData.nextCursor !== '-1' || afterData.newUser) {
    return;
  }

  const diff = _.omitBy(afterData, (value, key) => beforeData[key as keyof UserData] === value);
  console.log('diff', diff);

  if (!('lastUpdated' in diff && diff.lastUpdated)) {
    return;
  }

  const querySnapshot = await after.ref
    .collection('watches')
    .orderBy('getEndDate', 'desc')
    .limit(2)
    .get();
  if (querySnapshot.size !== 2) {
    return;
  }
  const watches = querySnapshot.docs.map((doc) => {
    const { followers, getEndDate } = doc.data() as { followers: string[]; getEndDate: FirebaseFirestore.Timestamp };
    return { followers, getEndDate };
  });

  const [newFollowers, oldFollowers] = watches.map((e) => e.followers);
  const came = _.difference(newFollowers, oldFollowers);
  const left = _.difference(oldFollowers, newFollowers);
  console.log(came, left);

  if (!came.length && !left.length) {
    return;
  }

  const client = new Twitter({
    consumer_key: env.twitter_api_key,
    consumer_secret: env.twitter_api_secret_key,
    access_token_key: afterData.twitterAccessToken,
    access_token_secret: afterData.twitterAccessTokenSecret,
  });

  const cameAndLeft = _.union(came, left);
  const users: {
    id: string;
    name: string;
    screenName: string;
    photoUrl: string;
    detail: boolean;
  }[] = [];

  const lookupResult = _.chunk(cameAndLeft, 100).map(async (lookups) => {
    const result = await client
      .get('users/lookup', {
        user_id: lookups.join(','),
      })
      .catch((error) => {
        return { error: true, message: error };
      });

    if ('error' in result) {
      console.error(afterData.id, result.message);
      return null;
    }

    (result as { id_str: string; name: string; screen_name: string; profile_image_url_https: string }[]).forEach(
      ({ id_str, name, screen_name, profile_image_url_https }) => {
        users.push({
          id: id_str,
          name,
          screenName: screen_name,
          photoUrl: profile_image_url_https,
          detail: true,
        });
      }
    );

    return null;
  });

  await Promise.all(lookupResult);

  const cameUsers = came.map((user) => {
    const obj = users.find((e) => e.id === user);

    if (!obj) {
      return {
        id: user,
        detail: false,
      };
    }
    return obj;
  });

  const leftUsers = left.map((user) => {
    const obj = users.find((e) => e.id === user);

    if (!obj) {
      return {
        id: user,
        detail: false,
      };
    }
    return obj;
  });

  const data = {
    cameUsers,
    leftUsers,
    durationStart: watches[1].getEndDate,
    durationEnd: watches[0].getEndDate,
  };

  await after.ref.collection('records').add(data);

  console.log(data);
};
