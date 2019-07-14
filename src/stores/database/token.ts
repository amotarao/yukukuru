import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { firestore } from '../../modules/firebase';

const tokensCollection = firestore.collection('tokens');

export interface TokenInterface {
  id: string;
  data: TokenDataInterface;
}

export interface TokenDataInterface {
  twitterAccessToken: string;
  twitterAccessTokenSecret: string;
  twitterId: string;
}

const useToken = () => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      return;
    }

    tokensCollection.doc(uid).onSnapshot((doc) => {
      setLoading(false);
      const { twitterAccessToken, twitterAccessTokenSecret, twitterId } = doc.data() as TokenDataInterface;

      if (!twitterAccessToken || !twitterAccessTokenSecret || !twitterId) {
        setHasToken(false);
        return;
      }
      setHasToken(true);
    });
  }, [uid]);

  return {
    isLoading,
    hasToken,
    setUid,
  };
};

export const TokenContainer = createContainer(useToken);
