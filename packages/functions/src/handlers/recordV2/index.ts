import { RecordV2, TwUserData, WatchV2 } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import { difference } from 'lodash';
import { addRecordsV2 } from '../../modules/firestore/recordsV2';
import { getToken } from '../../modules/firestore/tokens/get';
import { getTwUsers } from '../../modules/firestore/twUsers';
import { getLatestEndedWatchesV2Ids, getLatestWatchesV2FromId } from '../../modules/firestore/watchesV2';
import { convertTwUserDataToRecordV2User } from '../../modules/twitter-user-converter';
import { getUsers } from '../../modules/twitter/api/users';
import { getClient } from '../../modules/twitter/client';
import { mergeWatchesV2 } from '../../utils/followers/watchesV2';
import { TwitterErrorUser } from './../../modules/twitter/types';

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
    const uid = context.params.userId;

    console.log(`⚙️ Starting generate records for [${uid}].`);

    // ended が false の場合、終了している watch でないので終了
    if (data.ended === false) {
      console.log(`ℹ️ Not ended.`);
      return;
    }

    const [, , basisDocId] = await getLatestEndedWatchesV2Ids(uid, snapshot.id);
    if (!basisDocId) {
      console.log(`ℹ️ Not ended query.`);
      return;
    }

    const watches = await getLatestWatchesV2FromId(uid, basisDocId);
    const [oldWatch, newWatch] = mergeWatchesV2(watches, {
      includeFirst: true,
    });
    if (!oldWatch || !newWatch) {
      console.log(`ℹ️ Not merged watches.`);
      return;
    }

    const oldFollowers = oldWatch.followers;
    const newFollowers = newWatch.followers;

    const yuku = difference(oldFollowers, newFollowers);
    const kuru = difference(newFollowers, oldFollowers);

    // フォロワーの差分がない場合、終了する
    if (kuru.length === 0 && yuku.length === 0) {
      console.log(`✔️ Not exists diff.`);
      return;
    }

    const twitterIds = [...yuku, ...kuru];
    const twUsers = await getTwUsers(twitterIds).catch((e) => {
      console.error(e);
      return [];
    });
    const errorTwitterUsers = await getToken(uid)
      .then((token) => {
        if (!token) throw new Error();
        return getClient({
          accessToken: token.twitterAccessToken,
          accessSecret: token.twitterAccessTokenSecret,
        });
      })
      .then((client) => getUsers(client, twitterIds))
      .then((response) => {
        if ('error' in response) throw new Error();
        return response.errorUsers;
      })
      .catch(() => {
        console.log(`ℹ️ Not exists token or failed to get twitter users.`);
        return [];
      });

    const date = newWatch.date;
    const records = [
      ...yuku.map(generateRecord('yuku', date, twUsers, errorTwitterUsers)),
      ...kuru.map(generateRecord('kuru', date, twUsers, errorTwitterUsers)),
    ];
    await addRecordsV2(uid, records);

    console.log(`✔️ Completed generate records for [${uid}].`);
  });

/** Record データの生成 */
const generateRecord =
  (type: RecordV2['type'], date: Date, twUsers: TwUserData[], errorTwitterUsers: TwitterErrorUser[]) =>
  (twitterId: string): RecordV2<Date> => {
    const status = errorTwitterUsers.find((user) => user.id === twitterId)?.type ?? 'active';

    const record: RecordV2<Date> = {
      type,
      date,
      twitterId,
      status,
    };

    const twUser = twUsers.find((twUser) => twUser.id === twitterId);
    if (twUser) {
      record.user = convertTwUserDataToRecordV2User(twUser);
    }

    return record;
  };
