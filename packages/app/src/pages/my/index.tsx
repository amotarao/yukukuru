import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { LoadingCircle } from '../../components/atoms/LoadingCircle';
import { LoginPage } from '../../components/pages/LoginPage';
import { MyPage, MyPageProps } from '../../components/pages/MyPage';
import { useAuth } from '../../hooks/auth';
import { useRecords } from '../../hooks/records';
import { useToken } from '../../hooks/token';
import { setLastViewing } from '../../modules/firestore/userStatuses';

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

  // 各 hook に uid セット
  useEffect(() => {
    setRecordsUid(uid);
    setTokenUid(uid);
  }, [uid, setRecordsUid, setTokenUid]);

  // signin 処理
  useEffect(() => {
    if (!userIsLoading && !signingIn && !signedIn && 'login' in router.query) {
      signIn();
    }
    if (signedIn && 'login' in router.query) {
      router.replace('/my');
    }
  }, [userIsLoading, signingIn, signedIn, router, signIn]);

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
