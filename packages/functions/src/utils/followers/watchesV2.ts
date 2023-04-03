import { WatchV2 } from '@yukukuru/types';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { flatten, uniq } from 'lodash';

export type MergedWatchV2 = {
  ids: string[];
  followers: string[];
  date: Date;
};

/**
 * 分散された watches を まとめる
 */
export const mergeWatchesV2 = (
  watches: QueryDocumentSnapshot<WatchV2>[],
  { includeFirst = false, limit = -1 }: { includeFirst?: boolean; limit?: number } = {}
): MergedWatchV2[] => {
  const currentWatches: QueryDocumentSnapshot<WatchV2>[] = [];
  const watchesGroups: QueryDocumentSnapshot<WatchV2>[][] = [];

  watches.map((watch) => {
    // limit が与えられているとき(0以上)は、そこでマージの処理の実行を終了する
    if (-1 < limit && limit <= watchesGroups.length) {
      return;
    }

    currentWatches.push(watch);
    if (watch.data().ended) {
      watchesGroups.push([...currentWatches]);
      currentWatches.splice(0, currentWatches.length);
    }
  });

  const convertedWatches = watchesGroups.map((targetWatches) => {
    const ids = targetWatches.map((watch) => watch.id);
    const lastWatch = targetWatches.at(-1);

    if (!lastWatch) {
      throw new Error('lastWatch is undefined');
    }

    const watch: MergedWatchV2 = {
      ids,
      followers: uniq(flatten(targetWatches.map((watch) => watch.data().followers))),
      date: lastWatch.data().date.toDate(),
    };
    return watch;
  });

  if (includeFirst) {
    return convertedWatches;
  }
  return convertedWatches.slice(1);
};
