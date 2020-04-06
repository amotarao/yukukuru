import { RecordIdData, Record, RecordUserOld } from '../stores/database/records';

/**
 * Records を 表示用のデータに変換
 */
export const convertRecordsForView = (items: RecordIdData[]): Record[] => {
  if (!items.length) {
    return [];
  }

  const newItems: Record[] = [];

  items.forEach(({ data }) => {
    // 新しい Interface の record はそのまま push
    if ('type' in data) {
      newItems.push(data);
      return;
    }
    const { cameUsers, leftUsers, durationStart, durationEnd } = data;

    function convertItems(user: RecordUserOld, type: 'yuku' | 'kuru') {
      const item: Record = {
        user: {
          id: user.id,
          displayName: user.name,
          screenName: user.screenName,
          photoUrl: user.photoUrl,
          maybeDeletedOrSuspended: typeof user.notFounded !== 'undefined' ? user.notFounded : !user.photoUrl,
        },
        type,
        durationStart,
        durationEnd,
      };
      return item;
    }

    const covertedYukuItems = leftUsers.map((user) => convertItems(user, 'yuku'));
    const covertedKuruItems = cameUsers.map((user) => convertItems(user, 'kuru'));

    newItems.push(...covertedYukuItems, ...covertedKuruItems);
  });

  return newItems;
};
