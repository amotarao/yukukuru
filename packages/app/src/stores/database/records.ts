import { FirestoreIdData, RecordData, RecordDataOld } from '@yukukuru/types';
import { useState, useEffect, useCallback } from 'react';
import { createContainer } from 'unstated-next';
import firebase, { firestore } from '../../modules/firebase';
import { convertRecordsForView } from '../../utils/records';

const usersCollection = firestore.collection('users');

const convertRecordItems = (snapshot: firebase.firestore.QueryDocumentSnapshot) => {
  const item: FirestoreIdData<RecordData | RecordDataOld> = {
    id: snapshot.id,
    data: snapshot.data() as RecordData | RecordDataOld,
  };
  return item;
};

/**
 * Firestore から Records を取得
 *
 * @param uid 取得対象ユーザーのUID
 * @param startAfter cursor
 */
const getRecordsFromFirestore = async (
  uid: string,
  startAfter: firebase.firestore.QueryDocumentSnapshot | null
): Promise<firebase.firestore.QuerySnapshot> => {
  let query = usersCollection.doc(uid).collection('records').orderBy('durationEnd', 'desc');

  if (startAfter) {
    query = query.startAfter(startAfter);
  }

  query = query.limit(50);

  const qs = await query.get();
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
  const [items, setItems] = useState<RecordData[]>([]);

  /** Firebase UID */
  const [uid, setUid] = useState<string | null>(null);

  /** データ追加読み込み用のカーソル */
  const [cursor, setCursor] = useState<firebase.firestore.QueryDocumentSnapshot | null>(null);

  /**
   * Records を取得し処理する
   */
  const getRecords = useCallback(async () => {
    if (!uid) {
      return;
    }
    const { docs, size } = await getRecordsFromFirestore(uid, cursor);
    const newItems = convertRecordsForView(docs.map(convertRecordItems));

    setItems((items) => [...items, ...newItems].filter((item) => item.user.id !== 'EMPTY'));
    setHasNext(size >= 50);
    setCursor(size > 0 ? docs[size - 1] : null);

    // この順番でないと初回Records取得が再始動する
    setFirstLoaded(true);
    setFirstLoading(false);
    setNextLoading(false);
  }, [cursor, uid]);

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
    /** 最初のデータが読み込み中かどうか */
    isLoading: isFirstLoading || !isFirstLoaded,

    /** 続きのデータが読み込み中かどうか */
    isNextLoading,

    /** アイテム */
    items,

    /** アイテムがあるかどうか */
    hasItems: items.length > 0,

    /** 空のアイテムだけがあるかどうか */
    hasOnlyEmptyItems: items.length === 0 && cursor !== null,

    /** 続きのデータがあるかどうか */
    hasNext,

    /** 続きのデータを取得する */
    getNextRecords,

    /** uid をセットする */
    setUid: (uid: string) => {
      setUid(uid);
    },
  };
};

export const RecordsContainer = createContainer(useRecords);
