import { TokenData, UserData } from '@yukukuru/types';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as authSignOut,
  TwitterAuthProvider,
  UserInfo,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useReducer } from 'react';
import { auth } from '../modules/firebase';
import { firestore } from '../modules/firebase';
import { setToken } from '../modules/firestore/tokens';

type User = Pick<UserInfo, 'uid'>;

type State = {
  isLoading: boolean;
  signedIn: boolean;
  signingIn: boolean;
  user: User | null;
  twitter: UserData['twitter'] | null;
  token: TokenData | null;
};

const initialState: State = {
  isLoading: true,
  signedIn: false,
  signingIn: false,
  user: null,
  twitter: null,
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
      type: 'SetTwitter';
      payload: {
        twitter: State['twitter'];
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

    case 'SetTwitter': {
      return {
        ...state,
        twitter: action.payload.twitter,
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

export const useAuth = (): [Readonly<State>, Action] => {
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

  useEffect(() => {
    if (!state.user) {
      return;
    }

    getDoc(doc(firestore, 'users', state.user.uid)).then((doc) => {
      if (!doc.exists) {
        dispatch({ type: 'StartLoading' });
        return;
      }

      const twitter: State['twitter'] = doc.get('twitter') as UserData['twitter'];
      dispatch({ type: 'SetTwitter', payload: { twitter } });
    });
  }, [state.user]);

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
