'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useReducer } from 'react';
import { AuthContext, authInitialState, authReducer } from '../../lib/auth/context';
import { auth } from '../../lib/firebase';

export const AuthProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, authInitialState);

  // ログイン状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid } = user;
        dispatch({ type: 'SetUser', payload: { user: { uid }, uid } });
      } else {
        dispatch({ type: 'ClearUser' });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>;
};
