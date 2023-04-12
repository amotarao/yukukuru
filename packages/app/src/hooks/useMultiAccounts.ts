import { UserTwitter } from '@yukukuru/types';
import { collection, doc, documentId, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useReducer } from 'react';
import { firestore } from '../modules/firebase';
import { useSubscription } from './useSubscription';

type User = {
  id: string;
  twitter: UserTwitter;
};

type State = {
  accounts: User[];
  linkedUsers: User[];
  _loadings: [boolean, boolean, boolean];
  _authUser: User | null;
  _users: User[];
  _linkedUserIds: string[];
};

const initialState: State = {
  accounts: [],
  linkedUsers: [],
  _loadings: [false, false, false],
  _authUser: null,
  _users: [],
  _linkedUserIds: [],
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
      type: 'SetLinkedUserIds';
      payload: {
        _linkedUserIds: State['_linkedUserIds'];
      };
    }
  | {
      type: 'SetLinkedUsers';
      payload: {
        linkedUsers: State['linkedUsers'];
      };
    }
  | {
      type: 'StartLoading';
      payload: {
        target: number;
      };
    }
  | {
      type: 'FinishLoading';
      payload: {
        target: number;
      };
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
    case 'SetLinkedUserIds': {
      return {
        ...state,
        _linkedUserIds: action.payload._linkedUserIds,
      };
    }
    case 'SetLinkedUsers': {
      return {
        ...state,
        linkedUsers: action.payload.linkedUsers,
      };
    }
    case 'StartLoading': {
      const loadings = state._loadings;
      loadings[action.payload.target] = true;
      return {
        ...state,
        _loadings: loadings,
      };
    }
    case 'FinishLoading': {
      const loadings = state._loadings;
      loadings[action.payload.target] = false;
      return {
        ...state,
        _loadings: loadings,
      };
    }
    case 'Initialize': {
      return initialState;
    }
  }
};

export const useMultiAccounts = (
  authUid: string | null,
  currentUid: string | null
): [
  Readonly<
    Pick<State, 'accounts' | 'linkedUsers'> & {
      isLoading: boolean;
      currentAccount: User | null;
    }
  >
] => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { isSupporter } = useSubscription();

  // authUid に変更があれば、初期化
  useEffect(() => {
    dispatch({ type: 'Initialize' });
  }, [authUid]);

  // authUid に変化があれば、twitter, linkedUsers の取得処理
  useEffect(() => {
    if (!authUid) return;

    dispatch({ type: 'StartLoading', payload: { target: 0 } });

    const unsubscribe = onSnapshot(doc(firestore, 'users', authUid), (doc) => {
      if (!doc.exists()) {
        dispatch({ type: 'SetAuthUser', payload: { _authUser: null } });
        dispatch({
          type: 'SetLinkedUserIds',
          payload: { _linkedUserIds: [] },
        });
        dispatch({ type: 'FinishLoading', payload: { target: 0 } });
        return;
      }
      const twitter = doc.get('twitter') as UserTwitter;
      const user: User = { id: authUid, twitter };
      const linkedUserIds = doc.get('linkedUserIds') as string[];

      dispatch({ type: 'SetAuthUser', payload: { _authUser: user } });
      dispatch({
        type: 'SetLinkedUserIds',
        payload: { _linkedUserIds: linkedUserIds },
      });
      dispatch({ type: 'FinishLoading', payload: { target: 0 } });
    });

    return () => {
      unsubscribe();
    };
  }, [authUid]);

  // Twitter プロフィール取得処理
  useEffect(() => {
    if (!authUid || !isSupporter) return;

    dispatch({ type: 'StartLoading', payload: { target: 1 } });

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
        dispatch({ type: 'FinishLoading', payload: { target: 1 } });
      },
      () => {
        dispatch({ type: 'SetUsers', payload: { _users: [] } });
        dispatch({ type: 'FinishLoading', payload: { target: 1 } });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [authUid, isSupporter]);

  // linkedUsers に変化があれば、それぞれの Twitter プロフィールの取得
  useEffect(() => {
    if (state._linkedUserIds.length === 0) {
      dispatch({
        type: 'SetLinkedUsers',
        payload: { linkedUsers: [] },
      });
      return;
    }

    dispatch({ type: 'StartLoading', payload: { target: 2 } });

    const q = query(collection(firestore, 'users'), where(documentId(), 'in', state._linkedUserIds));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const linkedUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        twitter: doc.get('twitter') as UserTwitter,
      }));
      dispatch({
        type: 'SetLinkedUsers',
        payload: { linkedUsers },
      });
      dispatch({ type: 'FinishLoading', payload: { target: 2 } });
    });

    return () => {
      unsubscribe();
    };
  }, [state._linkedUserIds]);

  return [
    {
      isLoading: state._loadings.some((loading) => loading),
      accounts: state.accounts,
      currentAccount: state.accounts.find((account) => account.id === (currentUid || authUid)) || null,
      linkedUsers: state.linkedUsers,
    },
  ];
};
