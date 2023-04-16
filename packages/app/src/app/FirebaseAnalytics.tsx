'use client';

import { getAnalytics, isSupported } from 'firebase/analytics';
import { useEffect } from 'react';
import { firebaseApp } from '../modules/firebase';

export const FirebaseAnalytics: React.FC = () => {
  useEffect(() => {
    isSupported().then(() => {
      getAnalytics(firebaseApp);
    });
  }, []);

  return null;
};
