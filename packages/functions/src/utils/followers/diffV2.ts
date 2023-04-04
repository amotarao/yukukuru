import { RecordV2 } from '@yukukuru/types';
import * as _ from 'lodash';
import { MergedWatchV2 } from './watchesV2';

export type DiffV2 = Pick<RecordV2<Date>, 'type' | 'date' | 'twitterId'> & {
  watchesIds: string[];
  recordId: string;
};

const getDiffV2FollowersSingle = (start: MergedWatchV2, end: MergedWatchV2, watchesIds: string[]): DiffV2[] => {
  const yuku = _.difference(start.followers, end.followers);
  const kuru = _.difference(end.followers, start.followers);

  const yukuList = yuku.map(
    (twitterId): DiffV2 => ({ type: 'yuku', twitterId, date: end.date, watchesIds, recordId: '' })
  );
  const kuruList = kuru.map(
    (twitterId): DiffV2 => ({ type: 'kuru', twitterId, date: end.date, watchesIds, recordId: '' })
  );

  return [...yukuList, ...kuruList];
};

/**
 * 過去のフォロワー記録リストから差分比較用データを取得
 */
export const getDiffV2Followers = (watches: MergedWatchV2[]): DiffV2[] => {
  const diffs = watches.slice(0, watches.length - 1).map((currentWatch, i) => {
    const nextWatch = watches.at(i + 1);
    if (!currentWatch || !nextWatch) {
      throw new Error('current or next is undefined');
    }
    return getDiffV2FollowersSingle(currentWatch, nextWatch, currentWatch.ids);
  });
  return _.flatten(diffs);
};

export const checkDiffV2 = (diffA: DiffV2[], diffB: DiffV2[]): DiffV2[] => {
  return _.differenceBy(diffA, diffB, (diff) => diff.type + '_' + diff.date.toISOString() + '_' + diff.twitterId);
};
