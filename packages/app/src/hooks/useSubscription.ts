import { useEffect, useMemo, useState } from 'react';
import { getOwnActiveSubscriptions } from '../modules/firestore/stripe';

type Subscription = {
  status: string;
  role: string;
};

export const useSubscription = (uid: string | null) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    if (!uid) return;
    getOwnActiveSubscriptions(uid).then((querySnapshot) => {
      setSubscriptions(querySnapshot.docs.map((doc) => doc.data() as Subscription));
    });
  }, [uid]);

  const isSupporter = useMemo(
    () => subscriptions.find((subscription) => subscription.role === 'supporter')?.status === 'active',
    [subscriptions]
  );

  return {
    subscriptions,
    isSupporter,
  };
};
