import { signInWithPopup, signOut as authSignOut, TwitterAuthProvider } from 'firebase/auth';
import { useContext } from 'react';
import { auth } from '../firebase';
import { setToken } from '../firestore/tokens';
import { AuthContext } from './context';

export const useAuth = () => {
  const { state, dispatch } = useContext(AuthContext);

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
