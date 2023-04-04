import { RecordV2, User } from '@yukukuru/types';
import * as dayjs from 'dayjs';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import {
  addRecordsV2,
  getRecordsV2ByDuration,
  setRecordsV2DeletedByCheckIntegrity,
} from '../../modules/firestore/recordsV2';
import { getTwUsers } from '../../modules/firestore/twUsers';
import { getUserDocsByGroups } from '../../modules/firestore/users';
import { setCheckIntegrityV2Status } from '../../modules/firestore/users/state';
import { deleteWatchesV2, getOldestEndedWatchesV2Ids, getWatchesV2 } from '../../modules/firestore/watchesV2';
import { getGroupFromTime } from '../../modules/group';
import { publishMessages } from '../../modules/pubsub';
import { getDiffMinutes } from '../../modules/time';
import { DiffV2, checkDiffV2, getDiffV2Followers } from '../../modules/twitter-followers/diffV2';
import { mergeWatchesV2 } from '../../modules/twitter-followers/watchesV2';
import { convertTwUserToRecordV2User } from '../../modules/twitter-user-converter';

const topicName = 'checkIntegrityV2';

type Message = {
  /** Firebase UID */
  uid: string;

  /** 送信日時 */
  publishedAt: Date | string;
};

/**
 * 整合性チェック 定期実行
 * 整合性チェックのキューを作成
 */
export const publish = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = dayjs(context.timestamp);

    const groups = [getGroupFromTime(1, now.toDate())];
    const docs = await getUserDocsByGroups(groups);
    const targetDocs = docs.filter(filterExecutable(now.toDate()));

    const messages: Message[] = targetDocs.map((doc) => ({
      uid: doc.id,
      publishedAt: now.toDate(),
    }));
    await publishMessages(topicName, messages);

    console.log(`✔️ Completed publish ${messages.length} message.`);
  });

/** 実行可能かどうかを確認 */
const filterExecutable =
  (now: Date) =>
  (snapshot: QueryDocumentSnapshot<User>): boolean => {
    const { active, deletedAuth, _checkIntegrityV2Status } = snapshot.data();

    // 無効または削除済みユーザーの場合は実行しない
    if (!active || deletedAuth) {
      return false;
    }

    const minutes = getDiffMinutes(now, _checkIntegrityV2Status.lastRun.toDate());

    // 10分経過していれば実行
    if (minutes < 10) {
      return false;
    }
    return true;
  };

/** PubSub: 整合性チェック 個々の実行 */
export const run = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 60,
    memory: '4GB',
  })
  .pubsub.topic(topicName)
  .onPublish(async (message, context) => {
    const { uid, publishedAt } = message.json as Message;
    const now = new Date(context.timestamp);

    // 10秒以内の実行に限る
    if (now.getTime() - new Date(publishedAt).getTime() > 1000 * 10) {
      console.error(`❗️[Error]: Failed to run functions: published more than 10 seconds ago.`);
      return;
    }

    console.log(`⚙️ Starting check integrity for [${uid}].`);

    // 件数が少ない場合はキャンセル
    const endedDocIds = await getOldestEndedWatchesV2Ids(uid, 10);
    if (endedDocIds.length < 10) {
      console.log(`❗️ Canceled check integrity due to not enough watches.`);
      return;
    }

    // watches を 最古のものから取得
    const rawWatches = await getWatchesV2(uid, 1000);

    // 複数に分かれている watches を合算 (主にフォロワーデータが3万以上ある場合に発生)
    const mergedWatches = mergeWatchesV2(rawWatches, {
      includeFirst: true,
    });
    // 最後の3件は次回以降必要なので取り除く
    const targetMergedWatches = mergedWatches.slice(0, mergedWatches.length - 3);

    // watches が 3件未満の場合は終了
    if (targetMergedWatches.length < 3) {
      console.log(`❗️ Canceled check integrity due to not enough merged watches.`);
      return;
    }
    const currentDiffs = getDiffV2Followers(targetMergedWatches);

    // 最古の watches の取得時刻 (比較していくので2番目のドキュメント)
    const firstDate = targetMergedWatches.at(1)?.date ?? null;
    // 最新の watches の取得時刻
    const lastDate = targetMergedWatches.at(-1)?.date ?? null;
    if (firstDate === null || lastDate === null) {
      console.log(`❗️ Canceled check integrity due to can not get date.`);
      return;
    }

    // 期間内の records を取得
    const records = await getRecordsV2ByDuration(uid, firstDate, lastDate);
    const firestoreDiffs: DiffV2[] = records.map((doc) => ({
      type: doc.data().type,
      date: doc.data().date.toDate(),
      twitterId: doc.data().twitterId,
      recordId: doc.id,
      watchesIds: [],
    }));

    // 存在すべきなのに存在しない差分
    const notExistsDiffs = checkDiffV2(currentDiffs, firestoreDiffs);
    if (notExistsDiffs.length) {
      const twUsers = await getTwUsers(notExistsDiffs.map((diff) => diff.twitterId));
      console.log('ℹ️ notExistsDiffs');
      notExistsDiffs.forEach((diff) => console.log(JSON.stringify(diff)));
      const records = notExistsDiffs.map((diff) => {
        const record: RecordV2<Date> = {
          type: diff.type,
          date: diff.date,
          twitterId: diff.twitterId,
          status: 'unknown',
          _deleted: false,
          _addedBy: 'checkIntegrityV2',
          _deletedBy: null,
        };
        const twUser = twUsers.find((twUser) => twUser.id === diff.twitterId);
        if (twUser) {
          record.user = convertTwUserToRecordV2User(twUser);
        }
        return record;
      });
      await addRecordsV2(uid, records);
    }

    // 存在すべきではないが何故か存在する差分
    const unknownDiffs = checkDiffV2(firestoreDiffs, currentDiffs);
    if (unknownDiffs.length) {
      console.log('ℹ️ unknownDiffs');
      unknownDiffs.forEach((diff) => console.log(JSON.stringify(diff)));
      await setRecordsV2DeletedByCheckIntegrity(
        uid,
        unknownDiffs.map((diff) => diff.recordId)
      );
    }

    // watch 削除
    const deleteWatchesIds = targetMergedWatches.map((watch) => watch.ids).flat();
    await deleteWatchesV2(uid, deleteWatchesIds);

    await setCheckIntegrityV2Status(uid, now);
    console.log(`✔️ Completed check integrity for [${uid}] and deleted ${deleteWatchesIds.length} docs.`);
  });
