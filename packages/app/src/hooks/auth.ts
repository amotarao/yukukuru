import { TokenData } from '@yukukuru/types';
import {
  onAuthStateChanged,
  signInWithRedirect,
  signOut as authSignOut,
  TwitterAuthProvider,
  UserInfo,
} from 'firebase/auth';
import { useEffect, useReducer } from 'react';
import { auth } from '../modules/firebase';
import { setToken } from '../modules/firestore/tokens';

type User = Pick<UserInfo, 'uid'>;

type State = {
  isLoading: boolean;
  signedIn: boolean;
  signingIn: boolean;
  user: User | null;
  token: TokenData | null;
};

const initialState: State = {
  isLoading: true,
  signedIn: false,
  signingIn: false,
  user: null,
  token: null,
};

type DispatchAction =
  | {
      type: 'SetUser';
      payload: {
        user: User;
      };
    }
  | {
      type: 'ClearUser';
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
        token: TokenData;
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

export const useAuth = (): [State, Action] => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
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

    const token = await signInWithRedirect(auth, twitterAuthProvider)
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
