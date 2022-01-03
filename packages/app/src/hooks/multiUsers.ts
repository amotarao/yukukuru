import { UserData } from '@yukukuru/types';
import { collection, getDocs, where, query } from 'firebase/firestore';
import { useEffect, useReducer } from 'react';
import { firestore } from '../modules/firebase';

type State = {
  isLoading: boolean;
  users: {
    id: string;
    twitter: UserData['twitter'];
  }[];
};

const initialState: State = {
  isLoading: true,
  users: [],
};

type DispatchAction =
  | {
      type: 'SetUsers';
      payload: {
        users: State['users'];
      };
    }
  | {
      type: 'StartLoading';
    };

const reducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case 'SetUsers': {
      return {
        ...state,
        isLoading: false,
        users: action.payload.users,
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

export const useMultiUsers = (authUid: string | null): [Readonly<State>] => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({ type: 'StartLoading' });

    if (!authUid) {
      return;
    }

    const q = query(collection(firestore, 'users'), where('allowedAccessUsers', 'array-contains', authUid));
    getDocs(q).then((snapshot) => {
      const users = snapshot.docs.map((doc) => {
        const id = doc.id;
        const twitter = doc.get('twitter') as UserData['twitter'];
        return { id, twitter };
      });
      dispatch({ type: 'SetUsers', payload: { users: users } });
    });
  }, [authUid]);

  return [state];
};
