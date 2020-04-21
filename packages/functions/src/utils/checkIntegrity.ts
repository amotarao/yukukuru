import { FirestoreIdData, WatchData } from '@yukukuru/types';
import * as _ from 'lodash';
import { updateUserCheckIntegrity } from './firestore/users/integrity';
import { getRecords } from './firestore/records/getRecords';
import { getWatches } from './firestore/watches/getWatches';
import { removeWatches } from './firestore/watches/removeWatches';
import { getDiffFollowers, getDiffRecords, DiffWithId } from './diff';
import { convertRecords } from './convert';

type Props = {
  uid: string;
};

type convertWatchData = Pick<WatchData, 'followers' | 'getStartDate' | 'getEndDate'>;

const convertWatches = (watches: FirestoreIdData<WatchData>[]): { ids: string[]; watch: convertWatchData }[] => {
  const currentWatches: FirestoreIdData<WatchData>[] = [];
  const convertedWatchesGroups: FirestoreIdData<WatchData>[][] = [];

  watches.forEach((watch) => {
    currentWatches.push(watch);
    if (!('ended' in watch.data) || watch.data.ended) {
      convertedWatchesGroups.push([...currentWatches]);
      currentWatches.splice(0, currentWatches.length);
    }
  });

  const convertedWatches: { ids: string[]; watch: convertWatchData }[] = convertedWatchesGroups.map((watches) => {
    const ids = watches.map((watch) => watch.id);
    const watch = {
      followers: _.flatten(watches.map((watch) => watch.data.followers)),
      getStartDate: watches[0].data.getStartDate,
      getEndDate: watches[watches.length - 1].data.getEndDate,
    };
    return { ids, watch };
  });

  return convertedWatches;
};

export const checkIntegrity = async ({ uid }: Props, now: Date): Promise<void> => {
  const watches = convertWatches(await getWatches({ uid, count: 500 }));

  if (watches.length < 5) {
    return;
  }

  // 今回比較する watches 以外を取り除く
  watches.splice(watches.length - 3, watches.length);
  // 今回比較する watches のうち、最古のものの取得開始時刻
  const firstDate = watches[0].watch.getStartDate.toDate();
  // 今回比較する watches のうち、最新のものの取得開始時刻
  const lastDate = watches[watches.length - 1].watch.getStartDate.toDate();
  const records = await getRecords({ uid, cursor: firstDate, max: lastDate });

  const currentDiffs = getDiffFollowers(watches.map(({ watch }) => watch));
  const firestoreDiffsWithId: DiffWithId[] = convertRecords(records).map(({ id, data: record }) => ({
    id,
    diff: {
      type: record.type,
      uid: record.user.id,
      durationStart: record.durationStart.toDate(),
      durationEnd: record.durationEnd.toDate(),
    },
  }));
  const firestoreDiffs = firestoreDiffsWithId.map(({ diff }) => diff);

  // 存在すべきなのに存在する差分
  const notExistsDiffs = getDiffRecords(currentDiffs, firestoreDiffs);
  // 存在すべきではないが何故か存在する差分
  const unknownDiffs = getDiffRecords(firestoreDiffs, currentDiffs);

  console.log(JSON.stringify({ type: 'checkIntegrity', uid, notExistsDiffs, unknownDiffs }));

  // Todo: 存在しないドキュメントがある場合は追加する
  if (notExistsDiffs.length !== 0 && unknownDiffs.length === 0) {
    //
  }

  // 得体のしれないドキュメントがある場合はエラーを出す
  if (notExistsDiffs.length === 0 && unknownDiffs.length !== 0) {
    console.error(JSON.stringify({ type: 'checkIntegrity', uid, unknownDiffs }));
  }

  // 何も変化がない場合、そのまま削除する
  if (notExistsDiffs.length === 0 && unknownDiffs.length === 0) {
    const removeIds = _.flatten(watches.map(({ ids }) => ids).slice(0, watches.length - 1));
    await removeWatches({ uid, removeIds });
  }

  // Todo: durationStart だけ異なるドキュメントがある場合は、アップデートする
  // const a = unknownDiffs
  // .map((diff) => firestoreDiffsWithId.find((diffWithId) => diffWithId.diff === diff))
  // .map((diff) => ('id' in diff ? diff.id : null))
  // .filter((d): d is string => d !== null);

  await updateUserCheckIntegrity(uid, now);
};
