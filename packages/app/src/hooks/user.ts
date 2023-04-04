import { Timestamp } from '@yukukuru/types';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useReducer } from 'react';
import { firestore } from '../modules/firebase';

type State = {
  isLoading: boolean;
  lastRun: Date | null;
};

const initialState: State = {
  isLoading: true,
  lastRun: new Date(0),
};

type DispatchAction =
  | {
      type: 'SetLastRunnedGetFollowers';
      payload: {
        lastRun: Date | null;
      };
    }
  | {
      type: 'StartLoading';
    };

const reducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case 'SetLastRunnedGetFollowers': {
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

    default: {
      return state;
    }
  }
};

export const useUser = (uid: string | null): [Readonly<State>] => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!uid) {
      return;
    }

    dispatch({ type: 'StartLoading' });

    const unsubscribe = onSnapshot(doc(firestore, 'users', uid), (doc) => {
      if (!doc.exists()) {
        return;
      }

      const lastRun = (doc.get('_getFollowersV2Status.lastRun') as Timestamp).toDate();
      dispatch({
        type: 'SetLastRunnedGetFollowers',
        payload: { lastRun: lastRun > new Date(0) ? lastRun : null },
      });
      unsubscribe();
    });

    return () => {
      unsubscribe();
    };
  }, [uid]);

  return [state];
};
