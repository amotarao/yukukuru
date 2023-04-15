import { Record, RecordV2, Timestamp } from '@yukukuru/types';
import { QueryDocumentSnapshot, doc, getDoc } from 'firebase/firestore';
import { useEffect, useCallback, useReducer } from 'react';
import { firestore } from '../modules/firebase';
import { fetchRecords, fetchRecordsV2 } from '../modules/firestore/records';

type State = {
  /** 初期読み込み中かどうか */
  isFirstLoading: boolean;

  /** 続きを読み込み中かどうか */
  isNextLoading: boolean;

  /** 読み込みが完了しているかどうか */
  isFirstLoaded: boolean;

  /** lastRun が読み込み中かどうか */
  isLoadingLastRun: boolean;

  /** 記録リスト */
  records: (QueryDocumentSnapshot<Record | RecordV2> | { text: string })[];

  /** 続きデータがあるかどうか */
  hasNext: boolean;

  /** lastRun */
  lastRun: Date | null;

  /** 初期状態かどうか */
  _initialized: boolean;

  /** V2 の取得が完了しているかどうか */
  _isCompletedFetchV2: boolean;

  /** カーソル */
  _cursor: QueryDocumentSnapshot | Date | null;

  /** カーソル */
  _cursorV2: QueryDocumentSnapshot | null;
};

const initialState: State = {
  isFirstLoading: false,
  isNextLoading: false,
  isFirstLoaded: false,
  isLoadingLastRun: true,
  records: [],
  hasNext: true,
  lastRun: null,
  _initialized: false,
  _isCompletedFetchV2: false,
  _cursor: null,
  _cursorV2: null,
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
        docs: QueryDocumentSnapshot<Record>[];
        ended: boolean;
        cursor: QueryDocumentSnapshot | null;
      };
    }
  | {
      type: 'AddItemsV2';
      payload: {
        docs: QueryDocumentSnapshot<RecordV2>[];
        ended: boolean;
        cursor: QueryDocumentSnapshot | Date | null;
        cursorV2: QueryDocumentSnapshot | null;
      };
    }
  | {
      type: 'AddText';
      payload: {
        text: string;
      };
    }
  | {
      type: 'Initialize';
    }
  | {
      type: 'SetLastRun';
      payload: {
        lastRun: State['lastRun'];
      };
    }
  | {
      type: 'StartLoadingLastRun';
    };

const reducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case 'StartLoadInitialRecords': {
      return {
        ...state,
        _initialized: true,
        isFirstLoading: true,
        isNextLoading: false,
      };
    }
    case 'StartLoadNextRecords': {
      return {
        ...state,
        _initialized: true,
        isFirstLoading: false,
        isNextLoading: true,
      };
    }
    case 'FinishLoadRecords': {
      return {
        ...state,
        _initialized: true,
        isFirstLoaded: true,
        isFirstLoading: false,
        isNextLoading: false,
      };
    }
    case 'AddItems': {
      const { docs, ended, cursor } = action.payload;

      return {
        ...state,
        records: [...state.records, ...docs],
        hasNext: !ended,
        _cursor: cursor,
      };
    }
    case 'AddItemsV2': {
      const { docs, ended, cursor, cursorV2 } = action.payload;

      return {
        ...state,
        records: [...state.records, ...docs],
        // V1 に続きがある可能性があるので必ず true
        hasNext: true,
        _isCompletedFetchV2: ended,
        _cursor: cursor,
        _cursorV2: cursorV2,
      };
    }
    case 'AddText': {
      return {
        ...state,
        records: [...state.records, { text: action.payload.text }],
      };
    }
    case 'Initialize': {
      return initialState;
    }
    case 'SetLastRun': {
      return {
        ...state,
        isLoadingLastRun: false,
        lastRun: action.payload.lastRun,
      };
    }
    case 'StartLoadingLastRun': {
      return {
        ...state,
        isLoadingLastRun: true,
      };
    }
  }
};

export const useRecords = (uid: string | null) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const getRecordsV1 = useCallback(
    async (cursor = state._cursor) => {
      if (!uid) return;
      await fetchRecords(uid, 50, cursor).then(({ docs }) => {
        cursor instanceof Date &&
          docs.length &&
          dispatch({
            type: 'AddText',
            payload: { text: 'このあたりでは記録が二重で表示されている可能性があります' },
          });

        dispatch({
          type: 'AddItems',
          payload: {
            docs,
            ended: docs.length < 50,
            cursor: docs.at(-1) ?? null,
          },
        });
      });
    },
    [state._cursor, uid]
  );

  const getRecordsV2 = useCallback(async () => {
    if (!uid) return;
    await fetchRecordsV2(uid, 50, state._cursorV2).then(({ docs }) => {
      const ended = docs.length < 50;
      const cursor = docs.at(-1)?.data().date.toDate() ?? null;
      const cursorV2 = docs.at(-1) ?? null;

      dispatch({
        type: 'AddItemsV2',
        payload: {
          docs,
          ended,
          cursor,
          cursorV2,
        },
      });

      // V2 での取得が完了している場合は V1 の取得も行う
      if (ended) {
        return getRecordsV1(cursor);
      }
    });
  }, [state._cursorV2, uid, getRecordsV1]);

  // Records を取得し処理する
  const getRecords = useCallback(async () => {
    !state._isCompletedFetchV2 ? await getRecordsV2() : await getRecordsV1();
    dispatch({ type: 'FinishLoadRecords' });
  }, [state._isCompletedFetchV2, getRecordsV2, getRecordsV1]);

  // UID が変更した際は初期化する
  useEffect(() => {
    dispatch({ type: 'Initialize' });
  }, [uid]);

  // 初回 Records を取得する
  useEffect(() => {
    if (!uid || state._initialized) {
      return;
    }
    dispatch({ type: 'StartLoadInitialRecords' });
    getRecords();
  }, [uid, state._initialized, getRecords]);

  // 続きの Records を取得する
  const getNextRecords = () => {
    if (state.isNextLoading || !uid) {
      return;
    }
    dispatch({ type: 'StartLoadNextRecords' });
    getRecords();
  };

  // lastRun を取得する
  useEffect(() => {
    if (!uid) return;

    dispatch({ type: 'StartLoadingLastRun' });

    getDoc(doc(firestore, 'users', uid)).then((doc) => {
      if (!doc.exists()) {
        dispatch({
          type: 'SetLastRun',
          payload: { lastRun: null },
        });
        return;
      }

      const lastRun = (doc.get('_getFollowersV2Status.lastRun') as Timestamp).toDate();
      dispatch({
        type: 'SetLastRun',
        payload: { lastRun: lastRun > new Date(0) ? lastRun : null },
      });
    });
  }, [uid]);

  return {
    ...state,
    getNextRecords,
  };
};
