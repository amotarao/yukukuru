import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import firebase, { firestore } from '../../modules/firebase';
import { convertRecords } from '../../utils/records';

const usersCollection = firestore.collection('users');

export interface RecordInterface {
  id: string;
  data: RecordDataInterface;
}

export interface RecordDataInterface {
  cameUsers: RecordItemUserInterface[];
  leftUsers: RecordItemUserInterface[];
  durationStart: firebase.firestore.Timestamp;
  durationEnd: firebase.firestore.Timestamp;
}

export interface RecordItemUserInterface {
  id: string;
  screenName?: string;
  name?: string;
  photoUrl?: string;
  notFounded?: boolean;
}

export interface RecordViewInterface {
  date: number;
  cameUsers: RecordViewUserInterface[];
  leftUsers: RecordViewUserInterface[];
}

export interface RecordViewUserInterface {
  data: RecordItemUserInterface;
  duration: {
    start: firebase.firestore.Timestamp;
    end: firebase.firestore.Timestamp;
  };
}

const convertRecordItems = (snapshot: firebase.firestore.QueryDocumentSnapshot) => {
  const item: RecordInterface = {
    id: snapshot.id,
    data: snapshot.data() as RecordDataInterface,
  };
  return item;
};

const getRecords = async (uid: string, end: firebase.firestore.Timestamp): Promise<firebase.firestore.QuerySnapshot> => {
  const qs = await usersCollection
    .doc(uid)
    .collection('records')
    .orderBy('durationEnd', 'desc')
    .startAfter(end)
    .limit(20)
    .get();
  return qs;
};

const useRecords = () => {
  /** 読み込み中かどうか */
  const [isLoading, setLoading] = useState<boolean>(true);

  /** 続きのデータが読み込み中かどうか */
  const [isNextLoading, setNextLoading] = useState<boolean>(true);

  /** 続きのデータがあるかどうか */
  const [hasNext, setHasNext] = useState<boolean>(true);

  /** アイテム */
  const [items, setItems] = useState<RecordViewInterface[]>([]);

  /** アテムがあるかどうか */
  const [hasItems, setHasItems] = useState<boolean>(false);

  /** Firebase UID */
  const [uid, setUid] = useState<string | null>(null);

  /** アイテムの読み込みのカーソル代わり */
  const [lastDurationEnd, setLastDurationEnd] = useState<firebase.firestore.Timestamp>(firebase.firestore.Timestamp.now());

  const getNextRecords = () => {
    if (isNextLoading || !uid) {
      return;
    }
    setNextLoading(true);

    (async () => {
      const { docs, size } = await getRecords(uid, lastDurationEnd);
      const tmpItems = docs.map(convertRecordItems).sort((a, b) => b.data.durationEnd.seconds - a.data.durationEnd.seconds);
      const [newItems, newLastDurationEnd] = convertRecords(tmpItems);

      setItems([...items, ...newItems]);
      setLastDurationEnd(newLastDurationEnd);
      setHasNext(size >= 20);

      setNextLoading(false);
    })();
  };

  useEffect(() => {
    if (!uid) {
      return;
    }

    (async () => {
      const { docs, size } = await getRecords(uid, firebase.firestore.Timestamp.now());
      const tmpItems = docs.map(convertRecordItems).sort((a, b) => b.data.durationEnd.seconds - a.data.durationEnd.seconds);
      const [newItems, newLastDurationEnd] = convertRecords(tmpItems);

      setItems(newItems);
      setLastDurationEnd(newLastDurationEnd);
      setHasItems(size > 0);
      setHasNext(size >= 20);

      setLoading(false);
      setNextLoading(false);
    })();
  }, [uid]);

  return {
    isLoading,
    isNextLoading,
    items,
    hasItems,
    hasNext,
    setUid,
    getNextRecords,
  };
};

export const RecordsContainer = createContainer(useRecords);
