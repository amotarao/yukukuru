import { getAuth } from 'firebase/auth';
import type { AppProps } from 'next/app';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { SideNav } from '../components/SideNav';
import { TopNav } from '../components/TopNav';
import { firebaseApp } from '../modules/firebase';
import '../styles/globals.css';

const auth = getAuth(firebaseApp);

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  const [user, loading, error] = useAuthState(auth);

  return (
    <div className="grid grid-cols-[240px_1fr] grid-rows-[56px_1fr] min-h-screen">
      <TopNav className="sticky top-0" />
      <SideNav />
      <div className="px-8 py-10">
        {error ? (
          <p>{error.message}</p>
        ) : loading ? (
          <p>読み込み中</p>
        ) : !user ? (
          <p>ログインしてください</p>
        ) : (
          <Component {...pageProps} />
        )}
      </div>
    </div>
  );
};

export default MyApp;
