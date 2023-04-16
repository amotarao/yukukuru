'use client';

import { UserInfo } from 'firebase/auth';
import { createContext } from 'react';

export type AuthState = {
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

export const authInitialState: AuthState = {
  isLoading: true,
  signingIn: false,
  signedIn: false,
  user: null,
  uid: null,
};

export type AuthAction =
  | {
      type: 'SetUser';
      payload: {
        user: AuthState['user'];
        uid: AuthState['uid'];
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

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
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
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
}>({
  state: authInitialState,
  dispatch: () => undefined,
});
