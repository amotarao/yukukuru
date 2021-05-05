import Head from 'next/head';
import React, { useEffect } from 'react';
import { LoadingCircle } from '../../components/atoms/LoadingCircle';
import { LoginPage } from '../../components/pages/LoginPage';
import { MyPage, MyPageProps } from '../../components/pages/MyPage';
import { useAuth } from '../../hooks/auth';
import { useRecords } from '../../hooks/records';
import { useToken } from '../../hooks/token';

const Inner: React.FC = () => {
  const [{ isLoading: userIsLoading, signedIn, signingIn, user }, { signIn, signOut }] = useAuth();
  const uid = user?.uid ?? null;

  const [
    { isFirstLoading, isFirstLoaded, isNextLoading, items, hasOnlyEmptyItems, hasNext },
    { setUid: setRecordsUid, getNextRecords },
  ] = useRecords();
  const [{ isLoading: tokenIsLoading, hasToken }, { setUid: setTokenUid }] = useToken();

  const recordsIsLoading = isFirstLoading || !isFirstLoaded;
  const isLoading = userIsLoading || recordsIsLoading || tokenIsLoading;

  useEffect(() => {
    if (uid) {
      setRecordsUid(uid);
      setTokenUid(uid);
    }
  }, [uid, setRecordsUid, setTokenUid]);

  const props: MyPageProps = {
    isLoading,
    isNextLoading,
    items,
    hasItems: items.length > 0,
    hasOnlyEmptyItems,
    hasNext,
    hasToken,
    uid,
    getNextRecords,
    signOut,
  };

  return userIsLoading || signingIn ? (
    <LoadingCircle />
  ) : signedIn ? (
    <MyPage {...props} />
  ) : (
    <LoginPage signIn={signIn} />
  );
};

const Page: React.FC = () => {
  return (
    <>
      <Head>
        <title>マイページ - ゆくくる alpha</title>
      </Head>
      <Inner />
    </>
  );
};

export default Page;
