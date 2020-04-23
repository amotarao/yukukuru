import { RecordUserDataOld, RecordDataOld, WatchData, FirestoreDateLike } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import * as Twitter from 'twitter';
import * as _ from 'lodash';
import { firestore } from '../../modules/firebase';
import {
  checkNoUserMatches,
  checkInvalidToken,
  setTokenInvalid,
  getToken,
  setRecord,
  existsRecords,
  setTwUsers,
} from '../../utils/firestore';
import { getUsersLookup } from '../../utils/twitter';
import { getTwUser } from '../../utils/firestore/twUsers/getTwUser';

export default async (snapshot: FirebaseFirestore.DocumentSnapshot, context: functions.EventContext): Promise<void> => {
  const data = snapshot.data() as WatchData;
  const uid = context.params.userId as string;

  if (data.ended === false) {
    console.log(JSON.stringify({ uid, type: 'noEnded' }));
    return;
  }
  const endedQuery = await firestore
    .collection('users')
    .doc(uid)
    .collection('watches')
    .where('ended', '==', true)
    .orderBy('getEndDate', 'desc')
    .limit(3)
    .get();

  // 比較できるデータがない
  if (endedQuery.size < 2) {
    console.log(JSON.stringify({ uid, type: 'noPreviousWatch' }));
    return;
  }
  const endDates = endedQuery.docs.map((snap) => (snap.data() as WatchData).getEndDate);

  const startAfter: FirestoreDateLike = endedQuery.size === 3 ? endDates[2] : new Date('2000/1/1');
  const targetQuery = await firestore
    .collection('users')
    .doc(uid)
    .collection('watches')
    .orderBy('getEndDate')
    .startAfter(startAfter)
    .get();

  const oldFollowers: string[] = [];
  const newFollowers: string[] = [];

  targetQuery.docs.map((doc) => {
    const { followers, getEndDate } = doc.data() as WatchData;
    if (getEndDate.seconds <= endDates[1].seconds) {
      oldFollowers.push(...followers);
      return;
    }
    newFollowers.push(...followers);
    return;
  });

  const yuku = _.difference(oldFollowers, newFollowers);
  const kuru = _.difference(newFollowers, oldFollowers);

  // 差分なし
  if (!kuru.length && !yuku.length) {
    const exists = await existsRecords(uid);

    if (!exists) {
      const data: RecordDataOld = {
        cameUsers: [],
        leftUsers: [],
        durationStart: endDates[1],
        durationEnd: endDates[0],
      };
      await setRecord(uid, data);
    }

    console.log(JSON.stringify({ uid, type: 'noDiffs' }));
    return;
  }

  const token = await getToken(uid);
  if (!token) {
    await setTokenInvalid(uid);
    console.error(JSON.stringify({ uid, type: 'invalidToken' }));
    return;
  }

  const client = new Twitter({
    consumer_key: functions.config().twitter.consumer_key as string,
    consumer_secret: functions.config().twitter.consumer_secret as string,
    access_token_key: token.twitterAccessToken,
    access_token_secret: token.twitterAccessTokenSecret,
  });

  const result = await getUsersLookup(client, { usersId: [...kuru, ...yuku] });

  if ('errors' in result) {
    result.errors.forEach((error) => {
      if (!checkNoUserMatches([error])) {
        console.error(uid, error);
      }
    });

    if (checkInvalidToken(result.errors)) {
      await setTokenInvalid(uid);
    }
  }

  const lookupedUsers = 'errors' in result ? [] : result.response;

  const usersFromTw = lookupedUsers.map(({ id_str, name, screen_name, profile_image_url_https }) => {
    const convertedUser: RecordUserDataOld = {
      id: id_str,
      name: name,
      screenName: screen_name,
      photoUrl: profile_image_url_https,
      notFounded: false,
    };
    return convertedUser;
  });

  const findUser = async (userId: string): Promise<RecordUserDataOld> => {
    const userFromTw = usersFromTw.find((e) => e.id === userId);
    if (userFromTw) {
      return userFromTw;
    }

    const user = await getTwUser(userId);
    if (user === null) {
      const item: RecordUserDataOld = {
        id: userId,
        notFounded: true,
      };
      return item;
    }

    const item: RecordUserDataOld = {
      ...user.data,
      notFounded: true,
    };
    return item;
  };

  const [cameUsers, leftUsers] = await Promise.all([Promise.all(kuru.map(findUser)), Promise.all(yuku.map(findUser))]);

  const record: RecordDataOld = {
    cameUsers,
    leftUsers,
    durationStart: endDates[1],
    durationEnd: endDates[0],
  };
  const setRecordPromise = setRecord(uid, record);
  const setTwUsersPromise = setTwUsers(lookupedUsers);

  await Promise.all([setRecordPromise, setTwUsersPromise]);

  console.log(JSON.stringify({ uid, type: 'success', record }));
};
