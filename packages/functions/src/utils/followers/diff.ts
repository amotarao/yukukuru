import { RecordData, WatchData } from '@yukukuru/types';
import * as _ from 'lodash';

export type Diff = {
  type: RecordData['type'];
  twitterId: string;
  durationStart: Date;
  durationEnd: Date;
};

export type DiffWithId = {
  id: string;
  diff: Diff;
};

const getDiffFollowersSingle = (start: WatchData, end: WatchData): Diff[] => {
  const yuku = _.difference(start.followers, end.followers);
  const kuru = _.difference(end.followers, start.followers);

  const yukuList = yuku.map(
    (uid): Diff => ({
      type: 'yuku',
      twitterId: uid,
      durationStart: start.getStartDate.toDate(),
      durationEnd: end.getEndDate.toDate(),
    })
  );

  const kuruList = kuru.map(
    (uid): Diff => ({
      type: 'kuru',
      twitterId: uid,
      durationStart: start.getStartDate.toDate(),
      durationEnd: end.getEndDate.toDate(),
    })
  );

  return [...yukuList, ...kuruList];
};

/**
 * 過去のフォロワー記録リストから差分比較用データを取得
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

export const getDiffWithIdRecords = (diffA: DiffWithId[], diffB: DiffWithId[]): DiffWithId[] => {
  return _.differenceBy(diffA, diffB, ({ diff }) => JSON.stringify(diff));
};

/**
 * 差分のうち、すべて durationEnd が共通かどうか
 */
export const checkSameEndDiff = (diffsA: DiffWithId[], diffsB: DiffWithId[]): boolean => {
  const stringify = ({ diff }: DiffWithId): string => {
    return JSON.stringify({
      type: diff.type,
      id: diff.twitterId,
      end: diff.durationEnd.getTime(),
    });
  };
  const a = diffsA.map(stringify).sort().join();
  const b = diffsB.map(stringify).sort().join();
  return a === b;
};
