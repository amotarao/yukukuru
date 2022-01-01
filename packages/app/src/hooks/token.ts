import { TokenData } from '@yukukuru/types';
import { doc, onSnapshot } from 'firebase/firestore';
import { useState, useEffect, useReducer } from 'react';
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

type Action = {
  setUid: (uid: string | null) => void;
};

export const useToken = (): [Readonly<State>, Action] => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      return;
    }

    const unsubscribe = onSnapshot(doc(firestore, 'tokens', uid), (doc) => {
      if (!doc.exists) {
        dispatch({ type: 'ClearHasToken' });
        return;
      }

      const { twitterAccessToken, twitterAccessTokenSecret, twitterId } = doc.data() as TokenData;
      if (!twitterAccessToken || !twitterAccessTokenSecret || !twitterId) {
        dispatch({ type: 'ClearHasToken' });
        return;
      }

      dispatch({ type: 'SetHasToken' });
    });

    return () => {
      unsubscribe();
    };
  }, [uid]);

  return [state, { setUid }];
};
