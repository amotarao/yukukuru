import { TokenData } from '@yukukuru/types';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as authSignOut,
  TwitterAuthProvider,
  UserInfo,
} from 'firebase/auth';
import { useEffect, useReducer } from 'react';
import { auth } from '../modules/firebase';
import { setToken } from '../modules/firestore/tokens';

type State = {
  /** 読み込み中かどうか */
  isLoading: boolean;

  /** サインイン処理中かどうか */
  signingIn: boolean;

  /** サインイン済みかどうか */
  signedIn: boolean;

  /** ユーザーデータ */
  user: Pick<UserInfo, 'uid'> | null;

  /** トークンデータ */
  token: TokenData | null;
};

const initialState: State = {
  isLoading: true,
  signingIn: false,
  signedIn: false,
  user: null,
  token: null,
};

type DispatchAction =
  | {
      type: 'SetUser';
      payload: {
        user: State['user'];
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
    }
  | {
      type: 'SetToken';
      payload: {
        token: State['token'];
      };
    };

const reducer = (state: State, action: DispatchAction): State => {
  switch (action.type) {
    case 'SetUser': {
      return {
        ...state,
        signedIn: true,
        user: action.payload.user,
      };
    }

    case 'ClearUser': {
      return {
        ...state,
        signedIn: false,
        user: null,
        token: null,
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

    case 'SetToken': {
      return {
        ...state,
        token: action.payload.token,
      };
    }

    default: {
      return state;
    }
  }
};

type Action = {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuth = (): [Readonly<State>, Action] => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({ type: 'StartLoading' });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid } = user;
        dispatch({ type: 'SetUser', payload: { user: { uid } } });
      } else {
        dispatch({ type: 'ClearUser' });
      }
      dispatch({ type: 'FinishLoading' });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!state.token || !state.user) {
      return;
    }
    setToken(state.user.uid, state.token);
  }, [state.token, state.user]);

  const signIn = async () => {
    dispatch({ type: 'StartSignIn' });

    const twitterAuthProvider = new TwitterAuthProvider();
    twitterAuthProvider.setCustomParameters({
      lang: 'ja',
    });

    const token = await signInWithPopup(auth, twitterAuthProvider)
      .then((result) => {
        const user = result.user;
        const twitterId = user.providerData.find((provider) => provider.providerId === 'twitter.com')?.uid ?? '';
        const credential = TwitterAuthProvider.credentialFromResult(result);

        if (user && credential) {
          const token: TokenData = {
            twitterAccessToken: credential.accessToken || '',
            twitterAccessTokenSecret: credential.secret || '',
            twitterId,
          };
          return token;
        }
        return null;
      })
      .catch((error: Error) => {
        console.error(error.message);
        return null;
      });

    if (token) {
      dispatch({ type: 'SetToken', payload: { token } });
    }
    dispatch({ type: 'FinishSignIn' });
  };

  const signOut = async () => {
    await authSignOut(auth);
  };

  return [state, { signIn, signOut }];
};
