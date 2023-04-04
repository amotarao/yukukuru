import { useEffect, useState } from 'react';
import { getOwnActiveSubscriptions } from '../modules/firestore/stripe';
import { useAuth } from './auth';

type Subscription = {
  status: string;
  role: string;
};

export const useSubscription = () => {
  const [{ uid, isLoading: isAuthLoading }] = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSupporter, setIsSupporter] = useState<boolean | null>(null);

  useEffect(() => {
    if (!uid) {
      setIsLoading(false);
      setIsSupporter(false);
      return;
    }
    setIsLoading(true);
    getOwnActiveSubscriptions(uid).then((querySnapshot) => {
      const subscriptions = querySnapshot.docs.map((doc) => doc.data() as Subscription);
      const isSupporter = subscriptions.find((subscription) => subscription.role === 'supporter')?.status === 'active';
      setIsSupporter(isSupporter);
      setIsLoading(false);
    });
  }, [uid]);

  return {
    isLoading: isAuthLoading || isLoading,
    isSupporter,
  };
};
