import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { useState, useEffect } from 'react';
import { firebaseApp } from './firebase';

export const useAnalytics = (): Analytics | null => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    isSupported().then(() => {
      setAnalytics(getAnalytics(firebaseApp));
    });
  });

  return analytics;
};
