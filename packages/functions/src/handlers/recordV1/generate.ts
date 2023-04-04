import { FirestoreDateLike, Watch, Record, RecordUser, Timestamp, RecordUserWithoutProfile } from '@yukukuru/types';
import { QuerySnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import * as _ from 'lodash';
import { EApiV1ErrorCode } from 'twitter-api-v2';
import { firestore } from '../../modules/firebase';
import { addRecords } from '../../modules/firestore/records/add';
import { getToken } from '../../modules/firestore/tokens';
import { setTokenInvalid } from '../../modules/firestore/tokens';
import { getTwUser, setTwUsers } from '../../modules/firestore/twUsers';
import { mergeWatches } from '../../modules/merge-watches';
import { convertTwUserToRecordUser, convertTwitterUserToRecordUser } from '../../modules/twitter-user-converter';
import { getUsers } from '../../modules/twitter/api/users';
import { getClient } from '../../modules/twitter/client';

/** Twitter から ユーザー情報リストを取得する */
const fetchUsersFromTwitter = async (uid: string, userIds: string[]): Promise<RecordUser[] | null> => {
  const token = await getToken(uid);
  if (token === null) {
    console.error(`❗️[Error]: Failed to get token of [${uid}]: Token is not exists.`);
    return null;
  }

  const client = getClient({
    accessToken: token.twitterAccessToken,
    accessSecret: token.twitterAccessTokenSecret,
  });
  const response = await getUsers(client, userIds);

  if ('error' in response) {
    if (response.error.hasErrorCode(EApiV1ErrorCode.InvalidOrExpiredToken)) {
      await setTokenInvalid(uid);
    }
  }

  const twUsers = 'error' in response ? [] : response.users;
  await setTwUsers(twUsers);

  const usersFromTw = twUsers.map(convertTwitterUserToRecordUser(false));
  return usersFromTw;
};

/** Record データの生成 */
const generateRecord =
  (type: Record['type'], durationStart: Timestamp, durationEnd: Timestamp, usersFromTwitter: RecordUser[]) =>
  async (id: string): Promise<Record> => {
    const findUser = async (userId: string): Promise<RecordUser> => {
      const userFromTw = usersFromTwitter.find((e) => e.id === userId);
      if (userFromTw) {
        return userFromTw;
      }

      const twUser = await getTwUser(userId);
      if (twUser === null) {
        const item: RecordUserWithoutProfile = {
          id: userId,
          maybeDeletedOrSuspended: true,
        };
        return item;
      }
      return convertTwUserToRecordUser(true)(twUser);
    };

    const user = await findUser(id);
    return {
      type,
      user,
      durationStart,
      durationEnd,
    };
  };

/** Firestore: watch が作成されたときの処理 */
export const generate = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 20,
    memory: '512MB',
  })
  .firestore.document('users/{userId}/watches/{watchId}')
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data() as Watch;
    const uid = context.params.userId as string;

    console.log(`⚙️ Starting generate records for [${uid}].`);

    // ended が false の場合、終了している watch でないので終了
    if (data.ended === false) {
      console.log(`[Info]: Stopped generate records for [${uid}]: Not ended.`);
      return;
    }

    const endedQuerySnapshot = (await firestore
      .collection('users')
      .doc(uid)
      .collection('watches')
      .where('ended', '==', true)
      .orderBy('getEndDate', 'desc') // 降順であることに注意する
      .startAfter(data.getEndDate)
      .select('getEndDate')
      .limit(2)
      .get()) as QuerySnapshot<Pick<Watch, 'getEndDate'>>;
    // 比較できるデータがない場合、終了する
    if (endedQuerySnapshot.empty || endedQuerySnapshot.size < 2) {
      console.log(`[Info]: Stopped generate records for [${uid}]: Not ended query.`);
      return;
    }

    // 降順なので [1] の getEndDate を取得する
    const startAfter: FirestoreDateLike =
      endedQuerySnapshot.size === 2 ? endedQuerySnapshot.docs[1].data().getEndDate : new Date(2000, 0);

    const targetQuerySnapshot = (await firestore
      .collection('users')
      .doc(uid)
      .collection('watches')
      .orderBy('getEndDate') // 昇順であることに注意する
      .startAfter(startAfter)
      .get()) as QuerySnapshot<Watch>;

    const watches = targetQuerySnapshot.docs;
    const [oldWatch, newWatch] = mergeWatches(watches, true);

    const oldFollowers = oldWatch.watch.followers;
    const newFollowers = newWatch.watch.followers;

    const yuku = _.difference(oldFollowers, newFollowers);
    const kuru = _.difference(newFollowers, oldFollowers);

    // フォロワーの差分がない場合、終了する
    if (!kuru.length && !yuku.length) {
      console.log(`[Info]: Stopped generate records for [${uid}]: Not exists diff.`);
      return;
    }

    const userIds = [...kuru, ...yuku];
    const usersFromTwitter = await fetchUsersFromTwitter(uid, userIds);
    if (usersFromTwitter === null) {
      return;
    }

    const durationStart = watches[0].data().getStartDate;
    const durationEnd = data.getEndDate;

    const yukuRecordsPromise = yuku.map(generateRecord('yuku', durationStart, durationEnd, usersFromTwitter));
    const kuruRecordsPromise = kuru.map(generateRecord('kuru', durationStart, durationEnd, usersFromTwitter));
    const records = await Promise.all([...kuruRecordsPromise, ...yukuRecordsPromise]);

    await addRecords(uid, records);

    console.log(`✔️ Completed generate records for [${uid}].`);
  });
