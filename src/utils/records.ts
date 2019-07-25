import { RecordInterface, RecordItemUserInterface, RecordViewInterface, RecordViewUserInterface } from '../stores/database/records';

const convertRecordUsers = (users: RecordItemUserInterface[], durationStart: firebase.firestore.Timestamp, durationEnd: firebase.firestore.Timestamp) => {
  return users.map(
    (user): RecordViewUserInterface => {
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

export const convertRecords = (items: RecordInterface[]): RecordViewInterface[] => {
  const newItems: RecordViewInterface[] = [];

  items.forEach(({ data: { cameUsers, leftUsers, durationStart, durationEnd } }) => {
    const date = Math.floor(durationEnd.seconds / 60 / 60 / 24);
    const newItem = newItems.find((newItem) => newItem.date === date);

    const newCameUsers = convertRecordUsers(cameUsers, durationStart, durationEnd);
    const newLeftUsers = convertRecordUsers(leftUsers, durationStart, durationEnd);

    if (!newItem) {
      const newData: RecordViewInterface = {
        date,
        cameUsers: newCameUsers,
        leftUsers: newLeftUsers,
      };
      newItems.push(newData);
      return;
    }
    newItem.cameUsers.push(...newCameUsers);
    newItem.leftUsers.push(...newLeftUsers);
  });

  return newItems;
};
