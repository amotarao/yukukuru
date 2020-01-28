import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { auth, provider } from '../modules/firebase';
import { updateToken } from '../utils/functions';
import { TokenDataInterface } from './database/token';

const useUser = () => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [user, setUser] = useState<firebase.User | null>(null);
  const [token, setToken] = useState<TokenDataInterface | null>(null);

  useEffect(() => {
    auth.getRedirectResult().then(({ additionalUserInfo, credential, user }) => {
      if (additionalUserInfo && credential && user) {
        setToken({
          twitterAccessToken: (credential as any).accessToken,
          twitterAccessTokenSecret: (credential as any).secret,
          twitterId: (additionalUserInfo.profile! as any).id_str!,
        });
      }
    });

    auth.onAuthStateChanged((user) => {
      setUser(user);
      setSignedIn(user !== null);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!token || !user) {
      return;
    }
    updateToken(token);
  }, [token, user]);

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
