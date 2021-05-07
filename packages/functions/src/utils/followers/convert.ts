import { FirestoreIdData, RecordData, RecordDataOld, RecordUserDataOld, RecordUserData } from '@yukukuru/types';
import * as _ from 'lodash';

/**
 * Records を 新しいタイプのインターフェイスに変換する
 */
export const convertRecords = (items: FirestoreIdData<RecordData | RecordDataOld>[]): FirestoreIdData<RecordData>[] => {
  if (!items.length) {
    return [];
  }

  const newItems: FirestoreIdData<RecordData>[] = [];

  items.forEach((item) => {
    if ('type' in item.data) {
      newItems.push({ id: item.id, data: item.data });
      return;
    }
    const { cameUsers, leftUsers, durationStart, durationEnd } = item.data;

    function convertItems(user: RecordUserDataOld, type: 'yuku' | 'kuru'): FirestoreIdData<RecordData> {
      const userData: RecordUserData = {
        id: user.id,
        displayName: user.name,
        screenName: user.screenName,
        photoUrl: user.photoUrl,
        maybeDeletedOrSuspended: typeof user.notFounded !== 'undefined' ? user.notFounded : !user.photoUrl,
      };

      const newItem: FirestoreIdData<RecordData> = {
        id: item.id,
        data: {
          type,
          user: _.pickBy(userData, (value) => value !== undefined) as RecordUserData,
          durationStart,
          durationEnd,
        },
      };
      return newItem;
    }

    const covertedYukuItems = leftUsers.map((user) => convertItems(user, 'yuku'));
    const covertedKuruItems = cameUsers.map((user) => convertItems(user, 'kuru'));

    newItems.push(...covertedYukuItems, ...covertedKuruItems);
  });

  return newItems;
};
