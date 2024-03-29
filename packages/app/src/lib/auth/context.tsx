'use client';

import { createContext } from 'react';

export type AuthState = {
  /** 読み込み中かどうか */
  isLoading: boolean;

  /** サインイン処理中かどうか */
  signingIn: boolean;

  /** サインイン済みかどうか */
  signedIn: boolean;

  /** UID */
  uid: string | null;
};

export const authInitialState: AuthState = {
  isLoading: true,
  signingIn: false,
  signedIn: false,
  uid: null,
};

export type AuthAction =
  | {
      type: 'SetUser';
      payload: {
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
        uid: action.payload.uid,
      };
    }
    case 'ClearUser': {
      return {
        ...state,
        isLoading: false,
        signedIn: false,
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
