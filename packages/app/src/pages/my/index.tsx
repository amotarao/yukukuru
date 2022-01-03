import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { LoadingCircle } from '../../components/atoms/LoadingCircle';
import { LoginPage } from '../../components/pages/LoginPage';
import { MyPage } from '../../components/pages/MyPage';
import { useAuth } from '../../hooks/auth';
import { useRecords } from '../../hooks/records';
import { useToken } from '../../hooks/token';
import { useUser } from '../../hooks/user';
import { setLastViewing } from '../../modules/firestore/userStatuses';

const Page: React.FC = () => {
  const [{ isLoading: authIsLoading, signedIn, signingIn, user }, { signIn }] = useAuth();
  const authUid = user?.uid ?? null;

  const [currentUid, setCurrentUid] = useState(authUid);
  useEffect(() => {
    setCurrentUid(authUid);
  }, [authUid]);

  const [{ isFirstLoading, isFirstLoaded, isNextLoading, items, hasNext }, { getNextRecords }] = useRecords(currentUid);
  const [{ isLoading: userIsLoading, lastRunnedGetFollowers, twitter }] = useUser(currentUid);
  const [{ isLoading: tokenIsLoading, hasToken }] = useToken(currentUid);

  const recordsIsLoading = isFirstLoading || !isFirstLoaded;
  const isLoading = authIsLoading || recordsIsLoading || userIsLoading || tokenIsLoading;

  // lastViewing 送信
  useEffect(() => {
    if (!currentUid) {
      return;
    }
    setLastViewing(currentUid);
  }, [currentUid]);

  return (
    <>
      <Head>
        <title>マイページ - ゆくくる alpha</title>
      </Head>
      {authIsLoading || signingIn ? (
        <LoadingCircle />
      ) : signedIn ? (
        <MyPage
          {...{
            isLoading,
            isNextLoading,
            items,
            hasNext,
            hasToken,
            lastRunnedGetFollowers,
            twitter,
            getNextRecords,
            changeCurrentUid: (uid) => {
              setCurrentUid(uid);
            },
          }}
        />
      ) : (
        <LoginPage signIn={signIn} />
      )}
    </>
  );
};

export default Page;
