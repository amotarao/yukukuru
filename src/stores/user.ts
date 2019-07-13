import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { auth } from '../modules/firebase';

const useUser = () => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [user, setUser] = useState<firebase.User | null>(null);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
      setSignedIn(Boolean(user));
      setLoading(false);
    });
  }, []);

  const signIn = async (token: string) => await auth.signInWithCustomToken(token);
  const signOut = async () => await auth.signOut();

  return {
    isLoading,
    signedIn,
    user,
    signIn,
    signOut,
  };
};

export const UserContainer = createContainer(useUser);
