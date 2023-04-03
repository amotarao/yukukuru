import { RecordUserData, RecordData, FirestoreDateLike, WatchData } from '@yukukuru/types';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import * as _ from 'lodash';
import { addRecords } from '../../modules/firestore/records/add';
import { getRecords } from '../../modules/firestore/records/get';
import { removeRecords } from '../../modules/firestore/records/remove';
import { updateRecordsStart } from '../../modules/firestore/records/update';
import { getTwUsers } from '../../modules/firestore/twUsers';
import { updateUserCheckIntegrity } from '../../modules/firestore/users/state';
import { deleteWatches, getWatches } from '../../modules/firestore/watches/getWatches';
import { removeWatches } from '../../modules/firestore/watches/removeWatches';
import { getDiffFollowers, DiffWithId, getDiffWithIdRecords, checkSameEndDiff } from '../../utils/followers/diff';
import { mergeWatches } from '../../utils/followers/watches';
import { log, errorLog } from '../../utils/log';
import { topicName, Message } from './_pubsub';

/** PubSub: 整合性チェック 個々の実行 */
export const run = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 60,
    memory: '4GB',
  })
  .pubsub.topic(topicName)
  .onPublish(async (message, context) => {
    const { uid, followersCount, publishedAt } = message.json as Message;
    const now = new Date(context.timestamp);

    // 10秒以内の実行に限る
    if (now.getTime() - new Date(publishedAt).getTime() > 1000 * 10) {
      console.error(`❗️[Error]: Failed to run functions: published more than 10 seconds ago.`);
      return;
    }

    console.log(`⚙️ Starting check integrity for [${uid}].`);

    // watches を 最古のものから 100件取得
    const rawWatches = await getWatches(uid, 100);

    const checked = await deleteBefore2021(uid, rawWatches);
    if (checked) {
      console.log(`✔️ Completed to delete watches of [${uid}].`);
      return;
    }

    // 複数に分かれている watches を合算 (主にフォロワーデータが3万以上ある場合に発生)
    const watches = mergeWatches(rawWatches, true, 50);
    // 最後の 3件は今回比較しないので取り除く
    watches.splice(watches.length - 3, watches.length);

    // watches が 2件未満の場合は終了
    if (watches.length < 2) {
      await updateUserCheckIntegrity(uid, now);
      return;
    }

    // 最古の watches の取得時刻
    const firstDate = watches[0].watch.getEndDate.toDate();
    // 最新の watches の取得時刻 (2つずつ比較していくので、最後から2番目のもの)
    const lastDate = watches[watches.length - 1].watch.getEndDate.toDate();

    // 期間内の records を取得
    const records = await getRecords(uid, firstDate, lastDate);

    const currentDiffs = getDiffFollowers(watches.map(({ watch }) => watch));
    const currentDiffsWithId: DiffWithId[] = currentDiffs.map((diff) => ({ id: '', diff }));

    const firestoreDiffsWithId: DiffWithId[] = records.map(({ id, data: record }) => ({
      id,
      diff: {
        type: record.type,
        twitterId: record.user.id,
        durationStart: record.durationStart.toDate(),
        durationEnd: record.durationEnd.toDate(),
      },
    }));

    // 存在すべきなのに存在しない差分
    const notExistsDiffs = getDiffWithIdRecords(currentDiffsWithId, firestoreDiffsWithId);
    // 存在すべきではないが何故か存在する差分
    const unknownDiffs = getDiffWithIdRecords(firestoreDiffsWithId, currentDiffsWithId);

    console.log(
      JSON.stringify({
        uid,
        notExistsDiffs: notExistsDiffs.map((diff) => `${diff.diff.type}: ${diff.diff.twitterId}`).slice(0, 20),
        unknownDiffs: unknownDiffs.map((diff) => `${diff.diff.type}: ${diff.diff.twitterId}`).slice(0, 20),
      })
    );

    // 存在しないドキュメントは追加する
    if (notExistsDiffs.length !== 0) {
      const twUsers = await getTwUsers(notExistsDiffs.map((diff) => diff.diff.twitterId));
      const items = notExistsDiffs.map(({ diff }): RecordData<FirestoreDateLike> => {
        const twUser = twUsers.find((twUser) => twUser.id === diff.twitterId) || null;
        const userData: RecordUserData =
          twUser === null
            ? {
                id: diff.twitterId,
                maybeDeletedOrSuspended: true,
              }
            : {
                id: diff.twitterId,
                screenName: twUser.screenName,
                displayName: twUser.name,
                photoUrl: twUser.photoUrl,
                maybeDeletedOrSuspended: false,
              };
        return {
          type: diff.type,
          user: userData,
          durationStart: diff.durationStart,
          durationEnd: diff.durationEnd,
        };
      });
      await addRecords(uid, items);
    }

    // 存在しないドキュメントがある場合は追加する
    if (notExistsDiffs.length !== 0 && unknownDiffs.length === 0) {
      log('onPublishCheckIntegrity', 'checkIntegrity', {
        type: 'hasNotExistsDiffs',
        uid,
        notExistsDiffs: notExistsDiffs.slice(0, 20),
      });
    }

    // 得体のしれないドキュメントがある場合はエラーを出す
    else if (notExistsDiffs.length === 0 && unknownDiffs.length !== 0) {
      const removeRecordIds = _.flatten(unknownDiffs.map(({ id }) => id));
      await removeRecords(uid, removeRecordIds);

      log('onPublishCheckIntegrity', 'checkIntegrity', {
        type: 'hasUnknownDiffs',
        uid,
        unknownDiffs: unknownDiffs.slice(0, 20),
        removeRecordIds: removeRecordIds.slice(0, 20),
      });
    }

    // 何も変化がない場合、そのまま削除する
    else if (notExistsDiffs.length === 0 && unknownDiffs.length === 0) {
      const removeIds = _.flatten(watches.map(({ ids }) => ids).slice(0, watches.length - 1));
      await removeWatches({ uid, removeIds });

      log('onPublishCheckIntegrity', 'checkIntegrity', {
        type: 'correctRecords',
        uid,
        removeIds: removeIds.slice(0, 20),
      });
    }

    // durationStart だけ異なるドキュメントがある場合は、アップデートする
    else if (checkSameEndDiff(notExistsDiffs, unknownDiffs)) {
      const starts = _.sortBy(notExistsDiffs, ({ diff: { type, twitterId, durationEnd } }) =>
        JSON.stringify({ type, twitterId, d: durationEnd.getTime() })
      );
      const targets = _.sortBy(unknownDiffs, ({ diff: { type, twitterId, durationEnd } }) =>
        JSON.stringify({ type, twitterId, d: durationEnd.getTime() })
      );

      const items = targets.map((target, i) => {
        return {
          id: target.id,
          start: starts[i].diff.durationStart,
        };
      });

      await updateRecordsStart(uid, items);
      log('onPublishCheckIntegrity', 'checkIntegrity', {
        type: 'sameEnd',
        uid,
        notExistsDiffs: notExistsDiffs.slice(0, 20),
        unknownDiffs: unknownDiffs.slice(0, 20),
        items: items.slice(0, 20),
      });
    }

    // 想定されていない処理
    else {
      errorLog('onPublishCheckIntegrity', 'checkIntegrity', {
        type: 'checkIntegrity: ERROR',
        uid,
        notExistsDiffs: notExistsDiffs.slice(0, 20),
        unknownDiffs: unknownDiffs.slice(0, 20),
      });
    }

    await updateUserCheckIntegrity(uid, now);

    console.log(`✔️ Completed check integrity for [${uid}].`);
  });

const checkIsBefore2021 = (docs: QueryDocumentSnapshot<WatchData>[]): boolean => {
  const lastDoc = docs.at(-1);
  if (!lastDoc) {
    return false;
  }
  return lastDoc.data().getEndDate.toDate() < new Date(2021, 0);
};

// 2021年より前のデータはすべて削除してしまう
// キャンセルする際は false
const deleteBefore2021 = async (uid: string, docs: QueryDocumentSnapshot<WatchData>[]): Promise<boolean> => {
  if (!checkIsBefore2021(docs)) {
    return false;
  }

  const index = docs
    .slice()
    .reverse()
    .findIndex((doc) => doc.data().ended);
  if (index < 0) {
    return false;
  }

  const deleteIds = docs.slice(0, -index).map((doc) => doc.id);
  await deleteWatches(uid, deleteIds);
  return true;
};
