import Head from 'next/head';
import React, { useEffect } from 'react';
import { LoadingCircle } from '../../components/atoms/LoadingCircle';
import { LoginPage } from '../../components/pages/LoginPage';
import { MyPage, MyPageProps } from '../../components/pages/MyPage';
import { useAuth } from '../../hooks/auth';
import { useToken } from '../../hooks/token';
import { RecordsContainer } from '../../store/database/records';

const Inner: React.FC = () => {
  const [{ isLoading: userIsLoading, signedIn, signingIn, user }, { signIn, signOut }] = useAuth();
  const uid = user?.uid ?? null;

  const {
    isLoading: recordsIsLoading,
    isNextLoading,
    items,
    hasItems,
    hasOnlyEmptyItems,
    hasNext,
    setUid: setRecordsUid,
    getNextRecords,
  } = RecordsContainer.useContainer();
  const [{ isLoading: tokenIsLoading, hasToken }, { setUid: setTokenUid }] = useToken();

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
    hasItems,
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
    <RecordsContainer.Provider>
      <Head>
        <title>マイページ - ゆくくる alpha</title>
      </Head>
      <Inner />
    </RecordsContainer.Provider>
  );
};

export default Page;
