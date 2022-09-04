import { UserData } from '@yukukuru/types';
import { collection, getDocs, doc, where, query, onSnapshot } from 'firebase/firestore';
import { useEffect, useReducer } from 'react';
import { firestore } from '../modules/firebase';

type User = {
  id: string;
  twitter: UserData['twitter'];
};

type State = {
  isLoading: boolean;
  accounts: User[];
  _authUser: User | null;
  _users: User[];
};

const initialState: State = {
  isLoading: true,
  accounts: [],
  _authUser: null,
  _users: [],
};

type DispatchAction =
  | {
      type: 'SetAuthUser';
      payload: {
        _authUser: NonNullable<State['_authUser']>;
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
        accounts: [authUser, ...state._users],
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
        isLoading: true,
      };
    }

    case 'FinishLoading': {
      return {
        ...state,
        isLoading: false,
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

export const useMultiAccounts = (authUid: string | null): [Readonly<State>] => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // authUid に変更があれば初期化
  useEffect(() => {
    dispatch({ type: 'Initialize' });
  }, [authUid]);

  // Twitter プロフィール取得処理
  useEffect(() => {
    if (!authUid) {
      return;
    }

    dispatch({ type: 'StartLoading' });

    // 認証ユーザー
    const unsubscribe = onSnapshot(doc(firestore, 'users', authUid), (doc) => {
      if (!doc.exists()) {
        return;
      }

      const twitter = doc.get('twitter') as UserData['twitter'];
      const user: User = { id: authUid, twitter };
      dispatch({ type: 'SetAuthUser', payload: { _authUser: user } });
      dispatch({ type: 'FinishLoading' });
      unsubscribe();
    });

    // 閲覧可能ユーザー
    const q = query(collection(firestore, 'users'), where('allowedAccessUsers', 'array-contains', authUid));
    getDocs(q).then((snapshot) => {
      const users = snapshot.docs.map((doc) => {
        const id = doc.id;
        const twitter = doc.get('twitter') as UserData['twitter'];
        return { id, twitter };
      });
      dispatch({ type: 'SetUsers', payload: { _users: users } });
    });

    return () => {
      unsubscribe();
    };
  }, [authUid]);

  return [state];
};
