import { StripeRole } from '@yukukuru/types';
import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth/hooks';
import { getOwnActiveSubscriptions } from '../lib/firestore/stripe';

type Subscription = {
  status: string;
  role: string;
};

export const useSubscription = () => {
  const { uid, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stripeRole, setStripeRole] = useState<StripeRole>(null);

  useEffect(() => {
    if (!uid) {
      setIsLoading(false);
      setStripeRole(null);
      return;
    }
    setIsLoading(true);
    getOwnActiveSubscriptions(uid).then((querySnapshot) => {
      const subscriptions = querySnapshot.docs.map((doc) => doc.data() as Subscription);
      const role = subscriptions.find((subscription) => subscription.status === 'active')?.role ?? null;
      setStripeRole(role as StripeRole);
      setIsLoading(false);
    });
  }, [uid]);

  return {
    isLoading: isAuthLoading || isLoading,
    stripeRole,
  };
};
