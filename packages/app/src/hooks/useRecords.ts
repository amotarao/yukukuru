import { Record, RecordV2, StripeRole, Timestamp, User } from '@yukukuru/types';
import dayjs from 'dayjs';
import { QueryDocumentSnapshot, doc, getDoc } from 'firebase/firestore';
import { useEffect, useCallback, useReducer } from 'react';
import { firestore } from '../lib/firebase';
import { fetchRecords, fetchRecordsV2 } from '../lib/firestore/records';

type State = {
  /** 初期読み込み中かどうか */
  isFirstLoading: boolean;

  /** 続きを読み込み中かどうか */
  isNextLoading: boolean;

  /** 読み込みが完了しているかどうか */
  isFirstLoaded: boolean;

  /** UpdateStatus が読み込み中かどうか */
  isLoadingUpdateStatus: boolean;

  /** 記録リスト */
  records: (QueryDocumentSnapshot<Record | RecordV2> | { text: string })[];

  /** 続きデータがあるかどうか */
  hasNext: boolean;

  /** lastUpdated */
  lastUpdated: Date | null;

  /** nextUpdate */
  nextUpdate: Date | null;

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
  isLoadingUpdateStatus: true,
  records: [],
  hasNext: true,
  lastUpdated: null,
  nextUpdate: null,
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
      type: 'SetUpdateStatus';
      payload: {
        lastUpdated: State['lastUpdated'];
        nextUpdate: State['nextUpdate'];
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
    case 'SetUpdateStatus': {
      return {
        ...state,
        isLoadingUpdateStatus: false,
        lastUpdated: action.payload.lastUpdated,
        nextUpdate: action.payload.nextUpdate,
      };
    }
    case 'StartLoadingLastRun': {
      return {
        ...state,
        isLoadingUpdateStatus: true,
      };
    }
  }
};

// iOS 14 対応
const arrayAt = <T>(array: T[], at: number): T | undefined => {
  if (at < 0) {
    return array[array.length + at];
  }
  return array[at];
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
            cursor: arrayAt(docs, -1) ?? null,
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
      const cursor = arrayAt(docs, -1)?.data().date.toDate() ?? null;
      const cursorV2 = arrayAt(docs, -1) ?? null;

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

  // UpdateStatus を取得する
  useEffect(() => {
    if (!uid) return;

    dispatch({ type: 'StartLoadingLastRun' });

    getDoc(doc(firestore, 'users', uid)).then((doc) => {
      if (!doc.exists()) {
        dispatch({
          type: 'SetUpdateStatus',
          payload: { lastUpdated: null, nextUpdate: null },
        });
        return;
      }

      const data = doc.data() as User<Timestamp>;
      const lastUpdated = lastUpdatedDate(data._getFollowersV2Status.lastRun.toDate());

      dispatch({
        type: 'SetUpdateStatus',
        payload: {
          lastUpdated: lastUpdated,
          nextUpdate: calcNextUpdateDate(lastUpdated, data.role, data.twitter.protected, data.twitter.followersCount),
        },
      });
    });
  }, [uid]);

  return {
    ...state,
    getNextRecords,
  };
};

const lastUpdatedDate = (lastUpdated: Date): Date | null => {
  return lastUpdated > new Date(0) ? lastUpdated : null;
};

/**
 * サポーター・公開アカウントは、3分(+3分/1万)以内
 * サポーター・非公開アカウントは、15分(+15分/1万)以内
 * 通常・公開アカウントは、72時間(+3分/1万)以内
 * 通常・非公開アカウントは、72時間(+15分/1万)以内
 * 初回の場合は、ベースタイムなし
 */
const calcNextUpdateDate = (
  lastUpdated: Date | null,
  role: StripeRole,
  twitterProtected: boolean,
  followersCount: number
): Date | null => {
  if (!lastUpdated) return null;

  const baseMinutes = role === 'supporter' ? (twitterProtected ? 15 : 3) : 72 * 60;

  const additionalUnit = twitterProtected ? 15 : 3;
  const additionalCount = Math.ceil(followersCount / 10000) - 1;
  const additionalMinutes = additionalUnit * additionalCount;

  if (lastUpdated === null) {
    return dayjs().add(additionalMinutes, 'minute').toDate();
  }

  return dayjs(lastUpdated)
    .add(baseMinutes + additionalMinutes, 'minute')
    .toDate();
};
