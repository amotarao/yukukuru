import { TokenData } from '@yukukuru/types';
import type firebase from 'firebase';
import { useEffect, useReducer } from 'react';
import { auth, providers } from '../modules/firebase';
import { setToken } from '../modules/firestore/token';

type User = Pick<firebase.User, 'uid'>;

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
    const user = auth.currentUser;
    dispatch({ type: 'FinishLoading' });
    if (user) {
      const { uid } = user;
      dispatch({ type: 'SetUser', payload: { user: { uid } } });
    } else {
      dispatch({ type: 'ClearUser' });
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const { uid } = user;
        dispatch({ type: 'SetUser', payload: { user: { uid } } });
      } else {
        dispatch({ type: 'ClearUser' });
      }
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

    const token = await auth
      .signInWithPopup(providers.twitter)
      .then(({ additionalUserInfo, credential, user }) => {
        if (additionalUserInfo && credential && user) {
          const twitterId = (additionalUserInfo.profile as { id_str?: string }).id_str ?? '';
          const token: TokenData = {
            twitterAccessToken: (credential as any).accessToken,
            twitterAccessTokenSecret: (credential as any).secret,
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
    await auth.signOut();
  };

  return [state, { signIn, signOut }];
};
