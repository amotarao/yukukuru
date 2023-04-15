import { UserInfo, onAuthStateChanged } from 'firebase/auth';
import { createContext, useEffect, useReducer } from 'react';
import { auth } from '../../modules/firebase';

type State = {
  /** 読み込み中かどうか */
  isLoading: boolean;

  /** サインイン処理中かどうか */
  signingIn: boolean;

  /** サインイン済みかどうか */
  signedIn: boolean;

  /** ユーザーデータ */
  user: Pick<UserInfo, 'uid'> | null;

  /** UID */
  uid: string | null;
};

const initialState: State = {
  isLoading: true,
  signingIn: false,
  signedIn: false,
  user: null,
  uid: null,
};

type DispatchAction =
  | {
      type: 'SetUser';
      payload: {
        user: State['user'];
        uid: State['uid'];
      };
    }
  | {
      type: 'ClearUser';
    }
  | {
      type: 'StartSignIn';
    }
  | {
      type: 'FinishSignIn';
    };

const reducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case 'SetUser': {
      return {
        ...state,
        isLoading: false,
        signedIn: true,
        user: action.payload.user,
        uid: action.payload.uid,
      };
    }
    case 'ClearUser': {
      return {
        ...state,
        isLoading: false,
        signedIn: false,
        user: null,
        uid: null,
      };
    }
    case 'StartSignIn': {
      return {
        ...state,
        signingIn: true,
      };
    }
    case 'FinishSignIn': {
      return {
        ...state,
        signingIn: false,
      };
    }
  }
};

export const AuthContext = createContext<{
  state: State;
  dispatch: React.Dispatch<DispatchAction>;
}>({
  state: initialState,
  dispatch: () => undefined,
});

export const AuthProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ログイン状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid } = user;
        dispatch({ type: 'SetUser', payload: { user: { uid }, uid } });
      } else {
        dispatch({ type: 'ClearUser' });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>;
};
