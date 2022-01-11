import { FirestoreDateLike, WatchData, RecordData, RecordUserData } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import * as _ from 'lodash';
import { firestore } from '../../modules/firebase';
import { addRecords } from '../../modules/firestore/records/add';
import { getToken } from '../../modules/firestore/tokens/get';
import { setTokenInvalid } from '../../modules/firestore/tokens/set';
import { getTwUser, setTwUsers } from '../../modules/firestore/twUsers';
import { getClient } from '../../modules/twitter/client';
import { checkInvalidOrExpiredToken } from '../../modules/twitter/error';
import { getUsersLookup } from '../../modules/twitter/users/lookup';
import { mergeWatches } from '../../utils/followers/watches';

/** Firestore: watch が作成されたときの処理 */
export const generate = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 20,
    memory: '512MB',
  })
  .firestore.document('users/{userId}/watches/{watchId}')
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data() as WatchData;
    const uid = context.params.userId as string;

    console.log(`⚙️ Starting generate records for [${uid}].`);

    // ended が false の場合、終了している watch でないので終了
    if (data.ended === false) {
      console.log(`[Info]: Stopped generate records for [${uid}]: Not ended.`);
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
      console.log(`[Info]: Stopped generate records for [${uid}]: Not ended query.`);
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
      console.log(`[Info]: Stopped generate records for [${uid}]: Not exists diff.`);
      return;
    }

    const token = await getToken(uid);
    if (token === null) {
      console.error(`❗️[Error]: Failed to get token of [${uid}]: Token is not exists.`);
      return;
    }

    const client = getClient({
      access_token_key: token.twitterAccessToken,
      access_token_secret: token.twitterAccessTokenSecret,
    });
    const result = await getUsersLookup(client, { usersId: [...kuru, ...yuku] });

    if ('errors' in result) {
      if (checkInvalidOrExpiredToken(result.errors)) {
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
        id: user.id,
        screenName: user.screenName,
        displayName: user.name,
        photoUrl: user.photoUrl,
        maybeDeletedOrSuspended: true,
      };
      return item;
    };

    const yukuRecords = yuku.map(async (id): Promise<RecordData> => {
      const user = await findUser(id);
      return {
        type: 'yuku',
        user,
        durationStart,
        durationEnd,
      };
    });
    const kuruRecords = kuru.map(async (id): Promise<RecordData> => {
      const user = await findUser(id);
      return {
        type: 'kuru',
        user,
        durationStart,
        durationEnd,
      };
    });
    const records = await Promise.all([...kuruRecords, ...yukuRecords]);

    const addRecordsPromise = addRecords(uid, records);
    const setTwUsersPromise = setTwUsers(twUsers);

    await Promise.all([addRecordsPromise, setTwUsersPromise]);

    console.log(`✔️ Completed generate records for [${uid}].`);
  });
