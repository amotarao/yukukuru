import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { auth, provider } from '../modules/firebase';

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

  const signIn = () => auth.signInWithRedirect(provider);
  const signOut = () => auth.signOut();

  return {
    isLoading,
    signedIn,
    user,
    signIn,
    signOut,
  };
};

export const UserContainer = createContainer(useUser);
