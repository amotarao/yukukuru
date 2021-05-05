import { TokenData } from '@yukukuru/types';
import type firebase from 'firebase';
import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { auth, providers } from '../modules/firebase';
import { updateToken } from '../modules/functions';

type User = Pick<firebase.User, 'uid'>;

const useAuth = () => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [signingIn, setSigningIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<TokenData | null>(null);

  useEffect(() => {
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

  const signIn = () => {
    setSigningIn(true);

    const signIn = auth.signInWithPopup(providers.twitter);
    signIn
      .then(({ additionalUserInfo, credential, user }) => {
        if (additionalUserInfo && credential && user) {
          const twitterId = (additionalUserInfo.profile as { id_str?: string }).id_str ?? '';
          setToken({
            twitterAccessToken: (credential as any).accessToken,
            twitterAccessTokenSecret: (credential as any).secret,
            twitterId,
          });
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setSigningIn(false);
      });
  };
  const signOut = () => {
    auth.signOut();
  };

  return {
    isLoading,
    signedIn,
    signingIn,
    user,
    uid: user?.uid ?? null,
    signIn,
    signOut,
  };
};

export type AuthStoreType = ReturnType<typeof useAuth>;

export const AuthContainer = createContainer(useAuth);
