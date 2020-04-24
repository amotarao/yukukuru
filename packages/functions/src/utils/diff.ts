import { RecordData, WatchData } from '@yukukuru/types';
import * as _ from 'lodash';

export interface Diff {
  type: RecordData['type'];
  uid: string;
  durationStart: Date;
  durationEnd: Date;
}

export interface DiffWithId {
  id: string;
  diff: Diff;
}

const getDiffFollowersSingle = (start: WatchData, end: WatchData): Diff[] => {
  const yuku = _.difference(start.followers, end.followers);
  const kuru = _.difference(end.followers, start.followers);

  const yukuList = yuku.map(
    (uid): Diff => ({
      type: 'yuku',
      uid,
      durationStart: start.getStartDate.toDate(),
      durationEnd: end.getEndDate.toDate(),
    })
  );

  const kuruList = kuru.map(
    (uid): Diff => ({
      type: 'kuru',
      uid,
      durationStart: start.getStartDate.toDate(),
      durationEnd: end.getEndDate.toDate(),
    })
  );

  return [...yukuList, ...kuruList];
};

/**
 * 過去のフォロワー記録リストから差分データを取得
 */
export const getDiffFollowers = (watches: WatchData[]): Diff[] => {
  const diffs = watches.slice(0, watches.length - 1).map((watch, i) => {
    return getDiffFollowersSingle(watch, watches[i + 1]);
  });
  return _.flatten(diffs);
};

export const getDiffRecords = (diffA: Diff[], diffB: Diff[]): Diff[] => {
  return _.differenceBy(diffA, diffB, (diff) => JSON.stringify(diff));
};
