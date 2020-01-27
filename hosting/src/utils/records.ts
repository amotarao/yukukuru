import firebase, { firestore } from '../modules/firebase';
import { RecordIdData, RecordUser, RecordForView, RecordUserForView } from '../stores/database/records';

/**
 * Records の users を 表示用のデータに変換
 *
 * @param users ユーザーデータの配列
 * @param durationStart 期間開始日時
 * @param durationEnd 期間終了日時
 */
const convertRecordUsersForView = (users: RecordUser[], durationStart: firebase.firestore.Timestamp, durationEnd: firebase.firestore.Timestamp) => {
  return users.map(
    (user): RecordUserForView => {
      return {
        data: user,
        duration: {
          start: durationStart,
          end: durationEnd,
        },
      };
    }
  );
};

/**
 * Records を 表示用のデータに変換
 */
export const convertRecordsForView = (items: RecordIdData[]): [RecordForView[], firebase.firestore.Timestamp] => {
  if (!items.length) {
    return [[], firebase.firestore.Timestamp.now()];
  }

  const newItems: RecordForView[] = [];
  const timeZoneOffset = 9;

  items.forEach(({ data: { cameUsers, leftUsers, durationStart, durationEnd } }) => {
    const date = Math.floor((durationEnd.seconds / 60 / 60 + timeZoneOffset) / 24);
    const newItem = newItems.find((newItem) => newItem.date === date);

    const newCameUsers = convertRecordUsersForView(cameUsers, durationStart, durationEnd);
    const newLeftUsers = convertRecordUsersForView(leftUsers, durationStart, durationEnd);

    if (!newItem) {
      const newItem: RecordForView = {
        date,
        cameUsers: newCameUsers,
        leftUsers: newLeftUsers,
      };
      newItems.push(newItem);
      return;
    }
    newItem.cameUsers.push(...newCameUsers);
    newItem.leftUsers.push(...newLeftUsers);
  });

  const lastDurationEnd = items.sort((a, b) => a.data.durationEnd.seconds - b.data.durationEnd.seconds)[0].data.durationEnd;

  return [newItems, lastDurationEnd];
};
