import { Timestamp } from '@yukukuru/types';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect, useReducer } from 'react';
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
      type: 'FinishLoading';
    };

const reducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case 'SetLastRunnedGetFollowers': {
      return {
        isLoading: false,
        lastRunnedGetFollowers: action.payload.lastRunnedGetFollowers,
      };
    }

    case 'FinishLoading': {
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

type Action = {
  setUid: (uid: string | null) => void;
};

export const useUser = (): [State, Action] => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      return;
    }

    getDoc(doc(firestore, 'users', uid)).then((doc) => {
      if (!doc.exists) {
        dispatch({ type: 'FinishLoading' });
        return;
      }

      const lastRunnedGetFollowers = (doc.get('lastUpdated') as Timestamp).toDate();
      dispatch({ type: 'SetLastRunnedGetFollowers', payload: { lastRunnedGetFollowers } });
    });
  }, [uid]);

  return [state, { setUid }];
};
