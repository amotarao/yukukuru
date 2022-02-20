import { TokenData } from '@yukukuru/types';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useReducer } from 'react';
import { firestore } from '../modules/firebase';

type State = {
  isLoading: boolean;
  hasToken: boolean;
};

const initialState: State = {
  isLoading: true,
  hasToken: false,
};

type DispatchAction =
  | {
      type: 'SetHasToken';
    }
  | {
      type: 'ClearHasToken';
    };

const reducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case 'SetHasToken': {
      return {
        isLoading: false,
        hasToken: true,
      };
    }

    case 'ClearHasToken': {
      return {
        isLoading: false,
        hasToken: false,
      };
    }

    default: {
      return state;
    }
  }
};

export const useToken = (uid: string | null): [Readonly<State>] => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!uid) {
      return;
    }

    const unsubscribe = onSnapshot(doc(firestore, 'tokens', uid), (doc) => {
      if (!doc.exists()) {
        dispatch({ type: 'ClearHasToken' });
        return;
      }

      const { twitterAccessToken, twitterAccessTokenSecret } = doc.data() as TokenData;
      if (!twitterAccessToken || !twitterAccessTokenSecret) {
        dispatch({ type: 'ClearHasToken' });
        return;
      }

      dispatch({ type: 'SetHasToken' });
    });

    return () => {
      unsubscribe();
    };
  }, [uid]);

  return [state];
};
