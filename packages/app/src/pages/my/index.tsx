import Head from 'next/head';
import React, { useEffect } from 'react';
import { LoadingCircle } from '../../components/atoms/LoadingCircle';
import { LoginPage } from '../../components/pages/LoginPage';
import { MyPage, MyPageProps } from '../../components/pages/MyPage';
import { useAuth } from '../../hooks/auth';
import { useRecords } from '../../hooks/records';
import { useToken } from '../../hooks/token';
import { useUser } from '../../hooks/user';
import { setLastViewing } from '../../modules/firestore/userStatuses';

const Page: React.FC = () => {
  const [{ isLoading: authIsLoading, signedIn, signingIn, user }, { signIn, signOut }] = useAuth();
  const uid = user?.uid ?? null;

  const [{ isFirstLoading, isFirstLoaded, isNextLoading, items, hasNext }, { getNextRecords }] = useRecords(uid);
  const [{ isLoading: userIsLoading, lastRunnedGetFollowers }] = useUser(uid);
  const [{ isLoading: tokenIsLoading, hasToken }] = useToken(uid);

  const recordsIsLoading = isFirstLoading || !isFirstLoaded;
  const isLoading = authIsLoading || recordsIsLoading || userIsLoading || tokenIsLoading;

  // lastViewing 送信
  useEffect(() => {
    if (!uid) {
      return;
    }
    setLastViewing(uid);
  }, [uid]);

  const props: MyPageProps = {
    isLoading,
    isNextLoading,
    items,
    hasNext,
    hasToken,
    lastRunnedGetFollowers,
    getNextRecords,
    signIn,
    signOut,
  };

  return (
    <>
      <Head>
        <title>マイページ - ゆくくる alpha</title>
      </Head>
      {authIsLoading || signingIn ? (
        <LoadingCircle />
      ) : signedIn ? (
        <MyPage {...props} />
      ) : (
        <LoginPage signIn={signIn} />
      )}
    </>
  );
};

export default Page;
