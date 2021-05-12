import { FirestoreIdData, WatchData } from '@yukukuru/types';
import * as _ from 'lodash';

type MergedWatchData = Pick<WatchData, 'followers' | 'getStartDate' | 'getEndDate'>;

/**
 * 分散された watches を まとめる
 * includeFirst が true の場合、一番最初のデータは含めない
 */
export const mergeWatches = (
  watches: FirestoreIdData<WatchData>[],
  includeFirst = false,
  limit = -1
): { ids: string[]; watch: MergedWatchData }[] => {
  const uniqWatches = _.uniqBy(watches, (watch) => watch.data.getEndDate.toDate().getTime());
  const currentWatches: FirestoreIdData<WatchData>[] = [];
  const convertedWatchesGroups: FirestoreIdData<WatchData>[][] = [];

  uniqWatches.map((watch) => {
    if (-1 < limit && limit <= convertedWatchesGroups.length) {
      return;
    }

    currentWatches.push(watch);
    if (!('ended' in watch.data) || watch.data.ended) {
      convertedWatchesGroups.push([...currentWatches]);
      currentWatches.splice(0, currentWatches.length);
    }
  });

  const convertedWatches: { ids: string[]; watch: MergedWatchData }[] = convertedWatchesGroups.map((watches) => {
    const ids = watches.map((watch) => watch.id);
    const watch = {
      followers: _.uniq(_.flatten(watches.map((watch) => watch.data.followers))),
      getStartDate: watches[0].data.getStartDate,
      getEndDate: watches[watches.length - 1].data.getEndDate,
    };
    return { ids, watch };
  });

  if (includeFirst) {
    return convertedWatches;
  }
  return convertedWatches.slice(1);
};
