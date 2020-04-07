import { TokenData } from '@yukukuru/types';
import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { auth, provider } from '../modules/firebase';
import { updateToken } from '../utils/functions';

const useUser = () => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [user, setUser] = useState<firebase.User | null>(null);
  const [token, setToken] = useState<TokenData | null>(null);

  useEffect(() => {
    auth.getRedirectResult().then(({ additionalUserInfo, credential, user }) => {
      if (additionalUserInfo && credential && user) {
        const twitterId =
          (additionalUserInfo &&
            'profile' in additionalUserInfo &&
            additionalUserInfo.profile &&
            'id_str' in additionalUserInfo.profile &&
            (additionalUserInfo.profile as { id_str: string }).id_str) ||
          '';

        setToken({
          twitterAccessToken: (credential as { accessToken: string }).accessToken,
          twitterAccessTokenSecret: (credential as { secret: string }).secret,
          twitterId,
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
