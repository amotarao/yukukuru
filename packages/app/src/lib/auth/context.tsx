import { UserInfo } from 'firebase/auth';
import { createContext, useReducer } from 'react';

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
      type: 'StartLoading';
    }
  | {
      type: 'FinishLoading';
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
        signedIn: true,
        user: action.payload.user,
        uid: action.payload.uid,
      };
    }
    case 'ClearUser': {
      return {
        ...state,
        signedIn: false,
        user: null,
        uid: null,
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

  return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>;
};
