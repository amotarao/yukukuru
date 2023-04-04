import { Watch } from '@yukukuru/types';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import * as _ from 'lodash';

type MergedWatch = Pick<Watch, 'followers' | 'getStartDate' | 'getEndDate'>;

/**
 * 分散された watches を まとめる
 *
 * @param watches watch リスト
 * @param includeFirst まとめたあと、一番最初のデータを含めるかどうか
 * @param limit まとめたあとのデータの最大件数
 */
export const mergeWatches = (
  watches: QueryDocumentSnapshot<Watch>[],
  includeFirst = false,
  limit = -1
): { ids: string[]; watch: MergedWatch }[] => {
  const uniqWatches = _.uniqBy(watches, (watch) => watch.data().getEndDate.toDate().getTime());
  const currentWatches: QueryDocumentSnapshot<Watch>[] = [];
  const watchesGroups: QueryDocumentSnapshot<Watch>[][] = [];

  uniqWatches.map((watch) => {
    // limit が与えられているとき(0以上)は、そこでマージの処理の実行を終了する
    if (-1 < limit && limit <= watchesGroups.length) {
      return;
    }

    currentWatches.push(watch);
    if (!('ended' in watch.data()) || watch.data().ended) {
      watchesGroups.push([...currentWatches]);
      currentWatches.splice(0, currentWatches.length);
    }
  });

  const convertedWatches: { ids: string[]; watch: MergedWatch }[] = watchesGroups.map((targetWatches) => {
    const ids = targetWatches.map((watch) => watch.id);
    const watch = {
      followers: _.uniq(_.flatten(targetWatches.map((watch) => watch.data().followers))),
      getStartDate: targetWatches[0].data().getStartDate,
      getEndDate: targetWatches[targetWatches.length - 1].data().getEndDate,
    };
    return { ids, watch };
  });

  if (includeFirst) {
    return convertedWatches;
  }
  return convertedWatches.slice(1);
};
