import { UserTwitter } from '@yukukuru/types';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useReducer } from 'react';
import { firestore } from '../modules/firebase';
import { useSubscription } from './useSubscription';

type User = {
  id: string;
  twitter: UserTwitter;
};

type State = {
  accounts: User[];
  _loading: number;
  _authUser: User | null;
  _users: User[];
};

const initialState: State = {
  accounts: [],
  _loading: 0,
  _authUser: null,
  _users: [],
};

type DispatchAction =
  | {
      type: 'SetAuthUser';
      payload: {
        _authUser: State['_authUser'];
      };
    }
  | {
      type: 'SetUsers';
      payload: {
        _users: State['_users'];
      };
    }
  | {
      type: 'StartLoading';
    }
  | {
      type: 'FinishLoading';
    }
  | {
      type: 'Initialize';
    };

const reducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case 'SetAuthUser': {
      const authUser = action.payload._authUser;

      return {
        ...state,
        _authUser: authUser,
        accounts: authUser ? [authUser, ...state._users] : [...state._users],
      };
    }

    case 'SetUsers': {
      const users = action.payload._users;
      const accounts = state._authUser ? [state._authUser] : [];
      accounts.push(...users);

      return {
        ...state,
        _users: users,
        accounts,
      };
    }

    case 'StartLoading': {
      return {
        ...state,
        _loading: state._loading + 1,
      };
    }

    case 'FinishLoading': {
      return {
        ...state,
        _loading: state._loading - 1,
      };
    }

    case 'Initialize': {
      return initialState;
    }

    default: {
      return state;
    }
  }
};

export const useMultiAccounts = (
  authUid: string | null,
  currentUid: string | null
): [Readonly<Pick<State, 'accounts'> & { isLoading: boolean; currentAccount: User | null }>] => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { isSupporter } = useSubscription();

  // uid に変更があれば、初期化
  useEffect(() => {
    dispatch({ type: 'Initialize' });
  }, [authUid]);

  // uid に変化があれば、Twitter プロフィール取得処理
  useEffect(() => {
    if (!authUid) return;

    dispatch({ type: 'StartLoading' });

    const unsubscribe = onSnapshot(doc(firestore, 'users', authUid), (doc) => {
      if (!doc.exists()) {
        dispatch({ type: 'SetAuthUser', payload: { _authUser: null } });
        dispatch({ type: 'FinishLoading' });
        return;
      }
      const twitter = doc.get('twitter') as UserTwitter;
      const user: User = { id: authUid, twitter };
      dispatch({ type: 'SetAuthUser', payload: { _authUser: user } });
      dispatch({ type: 'FinishLoading' });
    });

    return () => {
      unsubscribe();
    };
  }, [authUid]);

  // Twitter プロフィール取得処理
  useEffect(() => {
    if (!authUid || !isSupporter) return;

    dispatch({ type: 'StartLoading' });

    const q = query(collection(firestore, 'users'), where('linkedUserIds', 'array-contains', authUid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const users = snapshot.docs.map((doc) => {
          const id = doc.id;
          const twitter = doc.get('twitter') as UserTwitter;
          return { id, twitter };
        });
        dispatch({ type: 'SetUsers', payload: { _users: users } });
        dispatch({ type: 'FinishLoading' });
      },
      () => {
        dispatch({ type: 'SetUsers', payload: { _users: [] } });
        dispatch({ type: 'FinishLoading' });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [authUid, isSupporter]);

  return [
    {
      isLoading: state._loading > 0,
      accounts: state.accounts,
      currentAccount: state.accounts.find((account) => account.id === currentUid) || null,
    },
  ];
};
