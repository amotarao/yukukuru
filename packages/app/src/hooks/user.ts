import { Timestamp } from '@yukukuru/types';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useReducer } from 'react';
import { firestore } from '../modules/firebase';

type State = {
  isLoading: boolean;
  lastRunnedGetFollowers: Date;
};

const initialState: State = {
  isLoading: true,
  lastRunnedGetFollowers: new Date(0),
};

type DispatchAction =
  | {
      type: 'SetLastRunnedGetFollowers';
      payload: {
        lastRunnedGetFollowers: Date;
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
        lastRunnedGetFollowers: action.payload.lastRunnedGetFollowers,
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

      const lastRunnedGetFollowersV1 = (doc.get('lastUpdated') as Timestamp).toDate();
      const lastRunnedGetFollowersV2 = (doc.get('_getFollowersV2Status.lastRun') as Timestamp).toDate();
      const lastRunnedGetFollowers =
        lastRunnedGetFollowersV2 > new Date(0) ? lastRunnedGetFollowersV2 : lastRunnedGetFollowersV1;
      dispatch({ type: 'SetLastRunnedGetFollowers', payload: { lastRunnedGetFollowers } });
      unsubscribe();
    });

    return () => {
      unsubscribe();
    };
  }, [uid]);

  return [state];
};
