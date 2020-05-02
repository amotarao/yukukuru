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
import { mergeWatches } from '../../utils/watches';

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

  const endedQuery = await firestore
    .collection('users')
    .doc(uid)
    .collection('watches')
    .where('ended', '==', true)
    .orderBy('getEndDate', 'desc')
    .startAfter(data.getEndDate)
    .limit(2)
    .get();

  // 比較できるデータがない
  if (endedQuery.empty) {
    console.log(JSON.stringify({ uid, type: 'noPreviousWatch' }));
    return;
  }
  const startDates = endedQuery.docs.map((snap) => (snap.data() as WatchData).getStartDate);
  const endDates = endedQuery.docs.map((snap) => (snap.data() as WatchData).getEndDate);

  const durationStart = startDates[0];
  const durationEnd = data.getEndDate;

  const startAfter: FirestoreDateLike = endedQuery.size === 2 ? endDates[1] : new Date(2000, 0);
  const targetQuery = await firestore
    .collection('users')
    .doc(uid)
    .collection('watches')
    .orderBy('getEndDate')
    .startAfter(startAfter)
    .get();

  const watchDocs = targetQuery.docs.map((doc) => {
    return {
      id: doc.id,
      data: doc.data() as WatchData,
    };
  });
  const [oldWatch, newWatch] = mergeWatches(watchDocs, true);

  const oldFollowers = oldWatch.watch.followers;
  const newFollowers = newWatch.watch.followers;

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
