import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { firestore } from '../../modules/firebase';
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

const useRecords = () => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isNextLoading, setNextLoading] = useState<boolean>(true);
  const [hasNext, setHasNext] = useState<boolean>(true);
  const [items, setItems] = useState<RecordViewInterface[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const [lastDurationEnd, setLastDurationEnd] = useState<firebase.firestore.Timestamp | null>(null);

  const getNextRecords = () => {
    if (isNextLoading || !uid) {
      return;
    }
    setNextLoading(true);

    (async () => {
      const query = await usersCollection
        .doc(uid)
        .collection('records')
        .orderBy('durationEnd', 'desc')
        .startAfter(lastDurationEnd)
        .limit(20)
        .get();

      const tmpItems = query.docs.map(convertRecordItems).sort((a, b) => b.data.durationEnd.seconds - a.data.durationEnd.seconds);
      const [newItems, newLastDurationEnd] = convertRecords(tmpItems);
      setItems([...items, ...newItems]);
      setLastDurationEnd(newLastDurationEnd);

      if (query.size < 20) {
        setHasNext(false);
      }

      setNextLoading(false);
    })();
  };

  useEffect(() => {
    if (!uid) {
      return;
    }

    (async () => {
      const query = await usersCollection
        .doc(uid)
        .collection('records')
        .orderBy('durationEnd', 'desc')
        .limit(20)
        .get();

      const tmpItems = query.docs.map(convertRecordItems).sort((a, b) => b.data.durationEnd.seconds - a.data.durationEnd.seconds);
      const [newItems, newLastDurationEnd] = convertRecords(tmpItems);
      setItems(newItems);
      setLastDurationEnd(newLastDurationEnd);

      if (query.size < 20) {
        setHasNext(false);
      }

      setLoading(false);
      setNextLoading(false);
    })();
  }, [uid]);

  return {
    isLoading,
    isNextLoading,
    items,
    hasNext,
    setUid,
    getNextRecords,
  };
};

export const RecordsContainer = createContainer(useRecords);
