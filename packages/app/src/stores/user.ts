import { TokenData } from '@yukukuru/types';
import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { auth, provider } from '../modules/firebase';
import { updateToken } from '../utils/functions';

function isUserInfo(data: unknown): data is { profile: { id_str: string } } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'profile' in data &&
    typeof data.profile === 'object' &&
    data.profile !== null &&
    'id_str' in data.profile &&
    typeof data.profile.id_str === 'string'
  );
}

function isCredential(data: unknown | null): data is { accessToken: string; secret: string } {
  return (
    data !== null &&
    'accessToken' in data &&
    'secret' in data &&
    typeof data.accessToken === 'string' &&
    typeof data.secret === 'string'
  );
}

const useUser = () => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [user, setUser] = useState<firebase.User | null>(null);
  const [token, setToken] = useState<TokenData | null>(null);

  useEffect(() => {
    auth.getRedirectResult().then(({ additionalUserInfo, credential, user }) => {
      if (additionalUserInfo && credential && user && isUserInfo(additionalUserInfo) && isCredential(credential)) {
        setToken({
          twitterAccessToken: credential.accessToken,
          twitterAccessTokenSecret: credential.secret,
          twitterId: additionalUserInfo.profile.id_str,
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
