import { FirestoreIdData, Record } from '@yukukuru/types';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { useEffect, useCallback, useReducer } from 'react';
import { getRecords as getRecordsFromFirestore } from '../modules/firestore/records';

const convertRecordItems = (snapshot: QueryDocumentSnapshot): FirestoreIdData<Record> => {
  const item: FirestoreIdData<Record> = {
    id: snapshot.id,
    data: snapshot.data() as Record,
  };
  return item;
};

type State = {
  /** 初期状態かどうか */
  initial: boolean;

  /** 初期読み込み中かどうか */
  isFirstLoading: boolean;

  /** 続きを読み込み中かどうか */
  isNextLoading: boolean;

  /** 読み込みが完了しているかどうか */
  isFirstLoaded: boolean;

  /** 記録リスト */
  items: FirestoreIdData<Record>[];

  /** 続きデータがあるかどうか */
  hasNext: boolean;

  /** カーソル */
  cursor: QueryDocumentSnapshot | null;
};

const initialState: State = {
  initial: true,
  isFirstLoading: false,
  isNextLoading: false,
  isFirstLoaded: false,
  items: [],
  hasNext: true,
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
        docs: QueryDocumentSnapshot[];
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
        initial: false,
        isFirstLoading: true,
        isNextLoading: false,
      };
    }

    case 'StartLoadNextRecords': {
      return {
        ...state,
        initial: false,
        isFirstLoading: false,
        isNextLoading: true,
      };
    }

    case 'FinishLoadRecords': {
      return {
        ...state,
        initial: false,
        isFirstLoaded: true,
        isFirstLoading: false,
        isNextLoading: false,
      };
    }

    case 'AddItems': {
      const docs = action.payload.docs;
      const count = docs.length;
      const items = docs.map(convertRecordItems).filter(({ data: { user } }) => {
        // 情報取得できない かつ 削除or凍結 のユーザーを除外
        // 本来はデータベースからも削除したいため、仮対応
        const hasDetail = 'displayName' in user && 'screenName' in user && 'photoUrl' in user;
        const maybeDeletedOrSuspended = user.maybeDeletedOrSuspended;
        return hasDetail || !maybeDeletedOrSuspended;
      });
      const cursor = count > 0 ? docs[count - 1] : null;

      return {
        ...state,
        initial: false,
        items: [...state.items, ...items],
        hasNext: count >= 50,
        cursor,
      };
    }

    case 'Initialize': {
      return initialState;
    }

    default: {
      return state;
    }
  }
};

type Action = {
  /** 続きのデータを取得する */
  getNextRecords: () => void;
};

export const useRecords = (uid: string | null): [Readonly<State>, Action] => {
  const [state, dispatch] = useReducer(reducer, initialState);

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
    dispatch({ type: 'Initialize' });
  }, [uid]);

  /**
   * 初回 Records を取得する
   */
  useEffect(() => {
    if (!uid || !state.initial) {
      return;
    }
    dispatch({ type: 'StartLoadInitialRecords' });
    getRecords();
  }, [uid, state.initial, getRecords]);

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

  return [state, { getNextRecords }];
};
