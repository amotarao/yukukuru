import Head from 'next/head';
import React, { useEffect } from 'react';
import { LoadingCircle } from '../../components/atoms/LoadingCircle';
import { LoginPage } from '../../components/pages/LoginPage';
import { SettingsPage } from '../../components/pages/SettingsPage';
import { useAuth } from '../../hooks/auth';
import { setLastViewing } from '../../modules/firestore/userStatuses';

const Page: React.FC = () => {
  const [{ isLoading: authIsLoading, signedIn, signingIn, user }, { signIn, signOut }] = useAuth();
  const uid = user?.uid ?? null;

  // lastViewing 送信
  useEffect(() => {
    if (!uid) {
      return;
    }
    setLastViewing(uid);
  }, [uid]);

  return (
    <>
      <Head>
        <title>設定 - ゆくくる alpha</title>
      </Head>
      {authIsLoading || signingIn ? (
        <LoadingCircle />
      ) : signedIn ? (
        <SettingsPage
          {...{
            signIn,
            signOut,
          }}
        />
      ) : (
        <LoginPage signIn={signIn} />
      )}
    </>
  );
};

export default Page;
