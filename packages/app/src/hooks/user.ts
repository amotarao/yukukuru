import { Timestamp } from '@yukukuru/types';
import { doc, getDoc } from 'firebase/firestore';
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

    getDoc(doc(firestore, 'users', uid)).then((doc) => {
      if (!doc.exists) {
        dispatch({ type: 'StartLoading' });
        return;
      }

      const lastRunnedGetFollowers = (doc.get('lastUpdated') as Timestamp).toDate();
      dispatch({ type: 'SetLastRunnedGetFollowers', payload: { lastRunnedGetFollowers } });
    });
  }, [uid]);

  return [state];
};
