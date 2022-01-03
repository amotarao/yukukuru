import { Timestamp, UserData } from '@yukukuru/types';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useReducer } from 'react';
import { firestore } from '../modules/firebase';

type State = {
  isLoading: boolean;
  lastRunnedGetFollowers: Date;
  twitter: UserData['twitter'] | null;
};

const initialState: State = {
  isLoading: true,
  lastRunnedGetFollowers: new Date(0),
  twitter: null,
};

type DispatchAction =
  | {
      type: 'SetLastRunnedGetFollowers';
      payload: {
        lastRunnedGetFollowers: Date;
      };
    }
  | {
      type: 'SetTwitter';
      payload: {
        twitter: UserData['twitter'];
      };
    }
  | {
      type: 'FinishLoading';
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

    case 'SetTwitter': {
      return {
        ...state,
        twitter: action.payload.twitter,
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

export const useUser = (uid: string | null): [Readonly<State>] => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!uid) {
      return;
    }

    getDoc(doc(firestore, 'users', uid)).then((doc) => {
      if (!doc.exists) {
        dispatch({ type: 'FinishLoading' });
        return;
      }

      const twitter = doc.get('twitter') as UserData['twitter'];
      dispatch({ type: 'SetTwitter', payload: { twitter } });

      const lastRunnedGetFollowers = (doc.get('lastUpdated') as Timestamp).toDate();
      dispatch({ type: 'SetLastRunnedGetFollowers', payload: { lastRunnedGetFollowers } });
    });
  }, [uid]);

  return [state];
};
