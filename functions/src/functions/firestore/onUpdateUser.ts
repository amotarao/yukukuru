import * as functions from 'firebase-functions';
import * as Twitter from 'twitter';
import * as _ from 'lodash';
import { env } from '../../utils/env';
import { checkInvalidToken, setTokenInvalid, getToken } from '../../utils/firestore';
import { UserData, UserWatchData, UserRecordUserItemData, UserRecordData } from '../../utils/interfaces';
import { getUsersLookup } from '../../utils/twitter';

export default async ({ after, before }: functions.Change<FirebaseFirestore.DocumentSnapshot>) => {
  const afterData = after.data() as UserData;
  const beforeData = before.data() as UserData;

  if (afterData.nextCursor !== '-1' || afterData.newUser) {
    // フォロワー取得途中 か 新規ユーザー
    return;
  }

  const diff = _.omitBy(afterData, (value, key) => beforeData[key as keyof UserData] === value);
  console.log('diff', diff);

  if (!('lastUpdated' in diff && diff.lastUpdated)) {
    // フォロワー取得更新なし
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
    return doc.data() as UserWatchData;
  });

  const [newFollowers, oldFollowers] = watches.map((e) => e.followers);
  const came = _.difference(newFollowers, oldFollowers);
  const left = _.difference(oldFollowers, newFollowers);
  console.log(came, left);

  if (!came.length && !left.length) {
    // 差分なし
    return;
  }

  const token = await getToken(after.id);
  if (!token) {
    console.log(after.id, 'no-token');
    await setTokenInvalid(after.id);
    return;
  }
  const { twitterAccessToken, twitterAccessTokenSecret } = token;

  const client = new Twitter({
    consumer_key: env.twitter_api_key,
    consumer_secret: env.twitter_api_secret_key,
    access_token_key: twitterAccessToken,
    access_token_secret: twitterAccessTokenSecret,
  });

  const result = await getUsersLookup(client, { usersId: [...came, ...left] });

  if ('errors' in result) {
    console.error(after.id, result);
    if (checkInvalidToken(result.errors)) {
      await setTokenInvalid(after.id);
    }
    return;
  }

  const users = result.response.map(({ id_str, name, screen_name, profile_image_url_https }) => {
    const convertedUser: UserRecordUserItemData = {
      id: id_str,
      name: name,
      screenName: screen_name,
      photoUrl: profile_image_url_https,
    };
    return convertedUser;
  });

  const findUser = (user: string): UserRecordUserItemData => {
    const obj = users.find((e) => e.id === user);
    if (!obj) {
      const response: UserRecordUserItemData = {
        id: user,
      };
      return response;
    }
    return obj;
  };

  const cameUsers = came.map(findUser);
  const leftUsers = left.map(findUser);

  const data: UserRecordData = {
    cameUsers,
    leftUsers,
    durationStart: watches[1].getEndDate,
    durationEnd: watches[0].getEndDate,
  };

  await after.ref.collection('records').add(data);

  console.log(data);
};
