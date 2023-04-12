import { Timestamp } from '@yukukuru/types';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useReducer } from 'react';
import { firestore } from '../modules/firebase';

type State = {
  isLoading: boolean;
  lastRun: Date | null;
};

const initialState: State = {
  isLoading: true,
  lastRun: null,
};

type DispatchAction =
  | {
      type: 'SetLastRun';
      payload: {
        lastRun: State['lastRun'];
      };
    }
  | {
      type: 'StartLoading';
    };

const reducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case 'SetLastRun': {
      return {
        ...state,
        isLoading: false,
        lastRun: action.payload.lastRun,
      };
    }
    case 'StartLoading': {
      return {
        ...state,
        isLoading: true,
      };
    }
  }
};

export const useLastRun = (uid: string | null): [Readonly<State>] => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!uid) return;

    dispatch({ type: 'StartLoading' });

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

  return [state];
};
