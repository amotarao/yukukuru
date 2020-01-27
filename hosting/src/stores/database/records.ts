import { useState, useEffect, useCallback } from 'react';
import { createContainer } from 'unstated-next';
import firebase, { firestore } from '../../modules/firebase';
import { convertRecordsForView } from '../../utils/records';

const usersCollection = firestore.collection('users');

export interface RecordIdData {
  id: string;
  data: Record;
}

export interface Record {
  cameUsers: RecordUser[];
  leftUsers: RecordUser[];
  durationStart: firebase.firestore.Timestamp;
  durationEnd: firebase.firestore.Timestamp;
}

export interface RecordUser {
  id: string;
  screenName?: string;
  name?: string;
  photoUrl?: string;
  notFounded?: boolean;
}

export interface RecordForView {
  date: number;
  cameUsers: RecordUserForView[];
  leftUsers: RecordUserForView[];
}

export interface RecordUserForView {
  data: RecordUser;
  duration: {
    start: firebase.firestore.Timestamp;
    end: firebase.firestore.Timestamp;
  };
}

const convertRecordItems = (snapshot: firebase.firestore.QueryDocumentSnapshot) => {
  const item: RecordIdData = {
    id: snapshot.id,
    data: snapshot.data() as Record,
  };
  return item;
};

const getRecordsFromFirestore = async (uid: string, end: firebase.firestore.Timestamp): Promise<firebase.firestore.QuerySnapshot> => {
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
  /** 最初のデータが読み込み中かどうか */
  const [isFirstLoading, setFirstLoading] = useState<boolean>(false);

  /** 最初のデータの読み込みが完了しているかどうか */
  const [isFirstLoaded, setFirstLoaded] = useState<boolean>(false);

  /** 続きのデータが読み込み中かどうか */
  const [isNextLoading, setNextLoading] = useState<boolean>(false);

  /** 続きのデータがあるかどうか */
  const [hasNext, setHasNext] = useState<boolean>(true);

  /** アイテム */
  const [items, setItems] = useState<RecordForView[]>([]);

  /** Firebase UID */
  const [uid, setUid] = useState<string | null>(null);

  /** アイテムの読み込みのカーソル代わり */
  const [lastDurationEnd, setLastDurationEnd] = useState<firebase.firestore.Timestamp>(firebase.firestore.Timestamp.now());

  /**
   * Records を取得し処理する
   */
  const getRecords = useCallback(async () => {
    if (!uid) {
      return;
    }
    const { docs, size } = await getRecordsFromFirestore(uid, lastDurationEnd);
    const tmpItems = docs.map(convertRecordItems).sort((a, b) => b.data.durationEnd.seconds - a.data.durationEnd.seconds);
    const [newItems, newLastDurationEnd] = convertRecordsForView(tmpItems);

    setItems((items) => [...items, ...newItems]);
    setLastDurationEnd(newLastDurationEnd);
    setHasNext(size >= 20);

    // この順番でないと初回Records取得が再始動する
    setFirstLoaded(true);
    setFirstLoading(false);
    setNextLoading(false);
  }, [lastDurationEnd, uid]);

  /**
   * 初回 Records を取得する
   */
  useEffect(() => {
    if (isFirstLoading || isFirstLoaded || !uid) {
      return;
    }
    setFirstLoading(true);
    getRecords();
  }, [getRecords, isFirstLoading, isFirstLoaded, uid]);

  /**
   * 続きの Records を取得する
   */
  const getNextRecords = () => {
    if (isNextLoading || !uid) {
      return;
    }
    setNextLoading(true);
    getRecords();
  };

  return {
    isLoading: isFirstLoading || !isFirstLoaded,
    isNextLoading,
    items,
    hasItems: items.length > 0,
    hasNext,
    setUid,
    getNextRecords,
  };
};

export const RecordsContainer = createContainer(useRecords);
