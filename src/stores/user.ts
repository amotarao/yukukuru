import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { auth, firestore, provider } from '../modules/firebase';

interface CredentialInterface {
  twitterAccessToken: string;
  twitterAccessTokenSecret: string;
  twitterId: string;
}

const useUser = () => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [user, setUser] = useState<firebase.User | null>(null);
  const [data, setData] = useState<CredentialInterface | null>(null);

  useEffect(() => {
    auth
      .getRedirectResult()
      .then(({ additionalUserInfo, credential, user }) => {
        if (additionalUserInfo && credential && user) {
          const twitterAccessToken = (credential as any).accessToken;
          const twitterAccessTokenSecret = (credential as any).secret;
          setData({ twitterAccessToken, twitterAccessTokenSecret, twitterId: (additionalUserInfo.profile! as any).id_str! });
        }
        setUser(user);
      })
      .catch(() => {
        setUser(null);
        setData(null);
      });
  }, []);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
      setSignedIn(Boolean(user));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    (async () => {
      if (data && user) {
        await firestore
          .collection('users')
          .doc(user.uid)
          .set(data, { merge: true });
      }
    })();
  }, [data, user]);

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
