import { RecordData, WatchData } from '@yukukuru/types';
import * as _ from 'lodash';

export interface Diff {
  type: RecordData['type'];
  uid: string;
  durationStart: Date;
  durationEnd: Date;
}

interface DiffJson {
  type: RecordData['type'];
  uid: string;
  durationStart: string;
  durationEnd: string;
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
  const diffAMap = diffA.map((diff) => JSON.stringify(diff));
  const diffBMap = diffB.map((diff) => JSON.stringify(diff));
  return _.difference(diffAMap, diffBMap).map(
    (str): Diff => {
      const obj = JSON.parse(str) as DiffJson;
      return {
        type: obj.type,
        uid: obj.uid,
        durationStart: new Date(obj.durationStart),
        durationEnd: new Date(obj.durationEnd),
      };
    }
  );
};
