import { onAuthStateChanged, signInWithPopup, signOut as authSignOut, TwitterAuthProvider } from 'firebase/auth';
import { useContext, useEffect } from 'react';
import { auth } from '../../modules/firebase';
import { setToken } from '../../modules/firestore/tokens';
import { AuthContext } from './context';

export const useAuth = () => {
  const { state, dispatch } = useContext(AuthContext);

  console.log({ ...state });

  // ログイン状態の監視
  useEffect(() => {
    console.log('dispatch: onAuthStateChanged');
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
  }, [dispatch]);

  // サインイン処理
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

  return {
    ...state,
    signIn,
    signOut,
  };
};
