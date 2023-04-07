import { RecordV2, RecordV2Type, TwUser, WatchV2 } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import { difference } from 'lodash';
import { addRecordsV2 } from '../../modules/firestore/recordsV2';
import { getToken } from '../../modules/firestore/tokens';
import { getTwUsersByIds } from '../../modules/firestore/twUsers';
import { getUser } from '../../modules/firestore/users';
import { getLatestEndedWatchesV2Ids, getLatestWatchesV2FromId } from '../../modules/firestore/watchesV2';
import { mergeWatchesV2 } from '../../modules/twitter-followers/watchesV2';
import { convertTwUserToRecordV2User, convertTwitterUserToRecordV2User } from '../../modules/twitter-user-converter';
import { getUsers } from '../../modules/twitter/api/users';
import { getClient } from '../../modules/twitter/client';
import { TwitterErrorUser, TwitterUser } from '../../modules/twitter/types';

/** Firestore: watch が作成されたときの処理 */
export const generateRecords = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 20,
    memory: '512MB',
  })
  .firestore.document('users/{userId}/watchesV2/{watchId}')
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data() as WatchV2;
    const userId = context.params.userId;

    console.log(`⚙️ Starting generate records for [${userId}].`);

    // ended が false の場合、終了している watch でないので終了
    if (data.ended === false) {
      console.log(`ℹ️ Not ended.`);
      return;
    }

    const [, , basisDocId] = await getLatestEndedWatchesV2Ids(userId, snapshot.id);

    const watches = await getLatestWatchesV2FromId(userId, basisDocId);
    const [oldWatch, newWatch] = mergeWatchesV2(watches, {
      includeFirst: true,
    });
    if (!oldWatch || !newWatch) {
      console.log(`ℹ️ Not merged watches.`);
      return;
    }

    const yuku = difference(oldWatch.followers, newWatch.followers);
    const kuru = difference(newWatch.followers, oldWatch.followers);

    // フォロワーの差分がない場合、終了する
    if (kuru.length === 0 && yuku.length === 0) {
      console.log(`✔️ Not exists diff.`);
      return;
    }

    const { twitterUsers, twitterErrorUsers, twUsers } = await getTwitterUsers(userId, [...yuku, ...kuru]);
    const records = [
      ...yuku.map(generateRecord('yuku', newWatch.date, twitterUsers, twitterErrorUsers, twUsers)),
      ...kuru.map(generateRecord('kuru', newWatch.date, twitterUsers, twitterErrorUsers, twUsers)),
    ];
    await addRecordsV2(userId, records);

    console.log(`✔️ Completed generate records for [${userId}].`);
  });

/** Record データの生成 */
const generateRecord =
  (
    type: RecordV2Type,
    date: Date,
    twitterUsers: TwitterUser[],
    twitterErrorUsers: TwitterErrorUser[],
    twUsers: TwUser[]
  ) =>
  (twitterId: string): RecordV2<Date> => {
    const status = twitterErrorUsers.find((user) => user.id === twitterId)?.type ?? 'active';

    const record: RecordV2<Date> = {
      type,
      date,
      twitterId,
      status,
      user: null,
      _deleted: false,
      _addedBy: 'recordV2',
      _deletedBy: null,
    };

    const twitterUser = twitterUsers.find((twitterUser) => twitterUser.id === twitterId);
    if (twitterUser) {
      record.user = convertTwitterUserToRecordV2User(twitterUser);
      return record;
    }

    const twUser = twUsers.find((twUser) => twUser.id === twitterId);
    if (twUser) {
      record.user = convertTwUserToRecordV2User(twUser);
      return record;
    }

    return record;
  };

const getOwnClient = async (uid: string) => {
  const token = await getToken(uid).then((token) => {
    if (!token) throw new Error();
    return getClient({
      accessToken: token.twitterAccessToken,
      accessSecret: token.twitterAccessTokenSecret,
    });
  });
  return token;
};

const getTwitterUsers = async (
  userId: string,
  twitterIds: string[]
): Promise<{ twitterUsers: TwitterUser[]; twitterErrorUsers: TwitterErrorUser[]; twUsers: TwUser[] }> => {
  const client = await getOwnClient(userId);
  const response = await getUsers(client, twitterIds);
  if ('users' in response) {
    const errorTwUsers = await getTwUsersByIds(response.errorUsers.map((user) => user.id)).catch(() => []);
    return { twitterUsers: response.users, twitterErrorUsers: response.errorUsers, twUsers: errorTwUsers };
  }
  console.log(`ℹ️ Not exists token or failed to get twitter users.`);

  // TwUsers に登録がない場合があるので、フォロワー数の時間分待機する
  const User = await getUser(userId);
  const waitingSecs = Math.ceil((Math.min(User.twitter.followersCount, 10000) / 400) * 0.25);
  await new Promise((resolve) => setTimeout(resolve, waitingSecs));
  const twUsers = await getTwUsersByIds(twitterIds).catch(() => []);

  return { twitterUsers: [], twitterErrorUsers: [], twUsers };
};
