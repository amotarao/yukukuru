import { FirestoreIdData, RecordData, RecordDataOld, RecordUserDataOld } from '@yukukuru/types';

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
      const newItem: FirestoreIdData<RecordData> = {
        id: item.id,
        data: {
          type,
          user: {
            id: user.id,
            displayName: user.name,
            screenName: user.screenName,
            photoUrl: user.photoUrl,
            maybeDeletedOrSuspended: typeof user.notFounded !== 'undefined' ? user.notFounded : !user.photoUrl,
          },
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
