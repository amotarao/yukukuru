import { UserData } from '@yukukuru/types';
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

  /** Twitter データ */
  twitter: UserData['twitter'] | null;
};

const initialState: State = {
  isLoading: true,
  signingIn: false,
  signedIn: false,
  user: null,
  uid: null,
  twitter: null,
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
      type: 'SetTwitter';
      payload: {
        twitter: State['twitter'];
      };
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

  // ログイン状態の監視
  useEffect(() => {
    dispatch({ type: 'StartLoading' });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid } = user;
        dispatch({ type: 'SetUser', payload: { user: { uid }, uid } });
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
    if (!state.user) {
      return;
    }

    getDoc(doc(firestore, 'users', state.user.uid)).then((doc) => {
      const twitter: State['twitter'] = doc.get('twitter') as UserData['twitter'];
      dispatch({ type: 'SetTwitter', payload: { twitter } });
    });
  }, [state.user]);

  const signIn = async () => {
    dispatch({ type: 'StartSignIn' });

    const twitterAuthProvider = new TwitterAuthProvider();
    twitterAuthProvider.setCustomParameters({ lang: 'ja' });

    const userCredential = await signInWithPopup(auth, twitterAuthProvider).catch((error: Error) => {
      console.error(error.message);
      return undefined;
    });
    await setToken(userCredential);

    dispatch({ type: 'FinishSignIn' });
  };

  // サインアウト処理
  const signOut = async () => {
    await authSignOut(auth);
  };

  return [state, { signIn, signOut }];
};
