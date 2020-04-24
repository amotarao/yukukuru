import { FirestoreDateLike, WatchData, RecordData, RecordUserData } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import * as Twitter from 'twitter';
import * as _ from 'lodash';
import { firestore } from '../../modules/firebase';
import {
  checkNoUserMatches,
  checkInvalidToken,
  setTokenInvalid,
  getToken,
  existsRecords,
  setTwUsers,
} from '../../utils/firestore';
import { getTwUser } from '../../utils/firestore/twUsers/getTwUser';
import { addRecords } from '../../utils/firestore/records/addRecords';
import { addRecord } from '../../utils/firestore/records/addRecord';
import { getUsersLookup } from '../../utils/twitter';

const emptyRecord: RecordData<FirestoreDateLike> = {
  type: 'kuru',
  user: {
    id: 'EMPTY',
    maybeDeletedOrSuspended: true,
  },
  durationStart: new Date(2000, 0),
  durationEnd: new Date(2000, 0),
};

export default async (snapshot: FirebaseFirestore.DocumentSnapshot, context: functions.EventContext): Promise<void> => {
  const data = snapshot.data() as WatchData;
  const uid = context.params.userId as string;

  // 終了している watch でなければ終了
  if (data.ended === false) {
    console.log(JSON.stringify({ uid, type: 'noEnded' }));
    return;
  }

  const sameQuery = await firestore
    .collection('users')
    .doc(uid)
    .collection('watches')
    .where('getStartDate', '==', data.getStartDate)
    .where('getEndDate', '==', data.getEndDate)
    .get();

  // 同じ時刻のものがある場合、スキップする
  if (sameQuery.size > 1) {
    console.log(JSON.stringify({ uid, type: 'sameWatch' }));
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
  const startDates = endedQuery.docs.map((snap) => (snap.data() as WatchData).getStartDate);
  const endDates = endedQuery.docs.map((snap) => (snap.data() as WatchData).getEndDate);

  const durationStart = startDates[1];
  const durationEnd = endDates[0];

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
      await addRecord({ uid, data: emptyRecord });
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

  const twUsers = 'errors' in result ? [] : result.response;

  const usersFromTw = twUsers.map((user) => {
    const convertedUser: RecordUserData = {
      id: user.id_str,
      screenName: user.screen_name,
      displayName: user.name,
      photoUrl: user.profile_image_url_https,
      maybeDeletedOrSuspended: false,
    };
    return convertedUser;
  });

  const findUser = async (userId: string): Promise<RecordUserData> => {
    const userFromTw = usersFromTw.find((e) => e.id === userId);
    if (userFromTw) {
      return userFromTw;
    }

    const user = await getTwUser(userId);
    if (user === null) {
      const item: RecordUserData = {
        id: userId,
        maybeDeletedOrSuspended: true,
      };
      return item;
    }

    const item: RecordUserData = {
      id: user.data.id,
      screenName: user.data.screenName,
      displayName: user.data.name,
      photoUrl: user.data.photoUrl,
      maybeDeletedOrSuspended: true,
    };
    return item;
  };

  const yukuRecords = yuku.map(
    async (id): Promise<RecordData> => {
      const user = await findUser(id);
      return {
        type: 'yuku',
        user,
        durationStart,
        durationEnd,
      };
    }
  );
  const kuruRecords = kuru.map(
    async (id): Promise<RecordData> => {
      const user = await findUser(id);
      return {
        type: 'kuru',
        user,
        durationStart,
        durationEnd,
      };
    }
  );
  const records = await Promise.all([...kuruRecords, ...yukuRecords]);

  const addRecordsPromise = addRecords({ uid, items: records });
  const setTwUsersPromise = setTwUsers(twUsers);

  await Promise.all([addRecordsPromise, setTwUsersPromise]);

  console.log(JSON.stringify({ uid, type: 'success', records }));
};
