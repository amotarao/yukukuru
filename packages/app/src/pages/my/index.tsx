import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { LoadingCircle } from '../../components/atoms/LoadingCircle';
import { LoginPage } from '../../components/pages/LoginPage';
import { MyPage, MyPageProps } from '../../components/pages/MyPage';
import { useAuth } from '../../hooks/auth';
import { useRecords } from '../../hooks/records';
import { useToken } from '../../hooks/token';

const Page: React.FC = () => {
  const router = useRouter();
  const [{ isLoading: userIsLoading, signedIn, signingIn, user }, { signIn, signOut }] = useAuth();
  const [
    { isFirstLoading, isFirstLoaded, isNextLoading, items, hasOnlyEmptyItems, hasNext },
    { setUid: setRecordsUid, getNextRecords },
  ] = useRecords();
  const [{ isLoading: tokenIsLoading, hasToken }, { setUid: setTokenUid }] = useToken();

  const uid = user?.uid ?? null;
  const recordsIsLoading = isFirstLoading || !isFirstLoaded;
  const isLoading = userIsLoading || recordsIsLoading || tokenIsLoading;

  useEffect(() => {
    setRecordsUid(uid);
    setTokenUid(uid);
  }, [uid, setRecordsUid, setTokenUid]);

  useEffect(() => {
    if (!userIsLoading && !signingIn && !signedIn && 'login' in router.query) {
      signIn();
      router.replace('/my');
    }
  }, [userIsLoading, signingIn, signedIn, router, signIn]);

  const props: MyPageProps = {
    isLoading,
    isNextLoading,
    items,
    hasOnlyEmptyItems,
    hasNext,
    hasToken,
    uid,
    getNextRecords,
    signOut,
  };

  return (
    <>
      <Head>
        <title>マイページ - ゆくくる alpha</title>
      </Head>
      {userIsLoading || signingIn ? (
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
