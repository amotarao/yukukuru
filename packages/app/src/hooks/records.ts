import { FirestoreIdData, RecordData } from '@yukukuru/types';
import type firebase from 'firebase';
import { useState, useEffect, useCallback, useReducer } from 'react';
import { getRecords as getRecordsFromFirestore } from '../modules/firestore/records';

const convertRecordItems = (snapshot: firebase.firestore.QueryDocumentSnapshot): FirestoreIdData<RecordData> => {
  const item: FirestoreIdData<RecordData> = {
    id: snapshot.id,
    data: snapshot.data() as RecordData,
  };
  return item;
};

type State = {
  /** 初期読み込み中かどうか */
  isFirstLoading: boolean;

  /** 続きを読み込み中かどうか */
  isNextLoading: boolean;

  /** 読み込みが完了しているかどうか */
  isFirstLoaded: boolean;

  /** 記録リスト */
  items: FirestoreIdData<RecordData>[];

  /** 続きデータがあるかどうか */
  hasNext: boolean;

  /** UID */
  uid: string | null;

  /** カーソル */
  cursor: firebase.firestore.QueryDocumentSnapshot | null;
};

const initialState: State = {
  isFirstLoading: false,
  isNextLoading: false,
  isFirstLoaded: false,
  items: [],
  hasNext: true,
  uid: null,
  cursor: null,
};

type DispatchAction =
  | {
      type: 'StartLoadInitialRecords';
    }
  | {
      type: 'StartLoadNextRecords';
    }
  | {
      type: 'FinishLoadRecords';
    }
  | {
      type: 'AddItems';
      payload: {
        docs: firebase.firestore.QueryDocumentSnapshot[];
      };
    }
  | {
      type: 'Initialize';
    };

const reducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case 'StartLoadInitialRecords': {
      return {
        ...state,
        isFirstLoading: true,
        isNextLoading: false,
      };
    }

    case 'StartLoadNextRecords': {
      return {
        ...state,
        isFirstLoading: false,
        isNextLoading: true,
      };
    }

    case 'FinishLoadRecords': {
      return {
        ...state,
        isFirstLoaded: true,
        isFirstLoading: false,
        isNextLoading: false,
      };
    }

    case 'AddItems': {
      const docs = action.payload.docs;
      const items = docs.map(convertRecordItems);
      const cursor = docs.length > 0 ? docs[docs.length - 1] : null;

      return {
        ...state,
        items: [...state.items, ...items],
        hasNext: items.length >= 50,
        cursor,
      };
    }

    case 'Initialize':
    default: {
      return initialState;
    }
  }
};

type Action = {
  /** 続きのデータを取得する */
  getNextRecords: () => void;

  /** uid をセットする */
  setUid: (uid: string | null) => void;
};

export const useRecords = (): [State, Action] => {
  const [state, dispatch] = useReducer(reducer, initialState);

  /** Firebase UID */
  const [uid, setUid] = useState<string | null>(null);

  /**
   * Records を取得し処理する
   */
  const getRecords = useCallback(() => {
    (async () => {
      if (!uid) {
        return;
      }
      const { docs } = await getRecordsFromFirestore(uid, state.cursor);
      dispatch({ type: 'AddItems', payload: { docs } });
      dispatch({ type: 'FinishLoadRecords' });
    })();
  }, [state.cursor, uid]);

  /**
   * UID が変更した際は初期化する
   */
  useEffect(() => {
    if (!uid) {
      dispatch({ type: 'Initialize' });
    }
  }, [uid]);

  /**
   * 初回 Records を取得する
   */
  useEffect(() => {
    if (state.isFirstLoading || state.isFirstLoaded || !uid) {
      return;
    }
    dispatch({ type: 'StartLoadInitialRecords' });
    getRecords();
  }, [getRecords, state.isFirstLoading, state.isFirstLoaded, uid]);

  /**
   * 続きの Records を取得する
   */
  const getNextRecords = () => {
    if (state.isNextLoading || !uid) {
      return;
    }
    dispatch({ type: 'StartLoadNextRecords' });
    getRecords();
  };

  return [state, { getNextRecords, setUid }];
};
