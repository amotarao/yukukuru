import { TokenData } from '@yukukuru/types';
import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { firestore } from '../../modules/firebase';

const tokensCollection = firestore.collection('tokens');

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
      if (!doc.exists) {
        setHasToken(false);
        return;
      }

      const { twitterAccessToken, twitterAccessTokenSecret, twitterId } = doc.data() as TokenData;
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

export type TokenStoreType = ReturnType<typeof useToken>;

export const TokenContainer = createContainer(useToken);
