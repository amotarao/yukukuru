import { FirestoreIdData, RecordData, RecordDataOld, RecordUserDataOld } from '@yukukuru/types';

/**
 * Records を 表示用のデータに変換
 */
export const convertRecordsForView = (items: FirestoreIdData<RecordData | RecordDataOld>[]): RecordData[] => {
  if (!items.length) {
    return [];
  }

  const newItems: RecordData[] = [];

  items.forEach(({ data }) => {
    // 新しい Interface の record はそのまま push
    if ('type' in data) {
      newItems.push(data);
      return;
    }
    const { cameUsers, leftUsers, durationStart, durationEnd } = data;

    function convertItems(user: RecordUserDataOld, type: 'yuku' | 'kuru') {
      const item: RecordData = {
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
