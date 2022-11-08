import { useEffect, useMemo, useState } from 'react';
import { getOwnActiveSubscriptions } from '../modules/firestore/stripe';
import { useAuth } from './auth';

type Subscription = {
  status: string;
  role: string;
};

export const useSubscription = () => {
  const [{ uid }] = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    if (!uid) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    getOwnActiveSubscriptions(uid).then((querySnapshot) => {
      setSubscriptions(querySnapshot.docs.map((doc) => doc.data() as Subscription));
      setIsLoading(false);
    });
  }, [uid]);

  const isSupporter = useMemo(
    () => subscriptions.find((subscription) => subscription.role === 'supporter')?.status === 'active',
    [subscriptions]
  );

  return {
    isLoading,
    subscriptions,
    isSupporter,
  };
};
