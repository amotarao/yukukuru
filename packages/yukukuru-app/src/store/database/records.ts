import { FirestoreIdData, RecordData, RecordDataOld } from '@yukukuru/types';
import { useState, useEffect, useCallback, useReducer } from 'react';
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

type State = {
  isFirstLoading: boolean;
  isNextLoading: boolean;
  isLoaded: boolean;
};

const initialState: State = {
  isFirstLoading: false,
  isNextLoading: false,
  isLoaded: false,
};

type Action =
  | {
      type: 'getRecordStarted';
      payload?: { isNext: boolean };
    }
  | {
      type: 'getRecordSuccess';
    };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'getRecordStarted': {
      return { ...state, isFirstLoading: true, isNextLoading: !!action.payload?.isNext };
    }
    case 'getRecordSuccess': {
      return { ...state, isLoaded: true, isFirstLoading: false, isNextLoading: false };
    }
  }
}

const useRecords = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

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

    dispatch({ type: 'getRecordSuccess' });
  }, [cursor, uid]);

  /**
   * 初回 Records を取得する
   */
  useEffect(() => {
    if (state.isFirstLoading || state.isLoaded || !uid) {
      return;
    }
    dispatch({ type: 'getRecordStarted' });
    getRecords();
  }, [getRecords, state.isFirstLoading, state.isLoaded, uid]);

  /**
   * 続きの Records を取得する
   */
  const getNextRecords = () => {
    if (state.isNextLoading || !uid) {
      return;
    }
    dispatch({ type: 'getRecordStarted', payload: { isNext: true } });
    getRecords();
  };

  return {
    /** 最初のデータが読み込み中かどうか */
    isLoading: state.isFirstLoading || !state.isLoaded,

    /** 続きのデータが読み込み中かどうか */
    isNextLoading: state.isNextLoading,

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

export type RecordsStoreType = ReturnType<typeof useRecords>;

export const RecordsContainer = createContainer(useRecords);
