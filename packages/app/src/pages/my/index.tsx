import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { LoadingCircle } from '../../components/atoms/LoadingCircle';
import { LoginPage } from '../../components/pages/LoginPage';
import { MyPage } from '../../components/pages/MyPage';
import { useAuth } from '../../hooks/auth';
import { useMultiUsers } from '../../hooks/multiUsers';
import { useRecords } from '../../hooks/records';
import { useToken } from '../../hooks/token';
import { useUser } from '../../hooks/user';
import { setLastViewing } from '../../modules/firestore/userStatuses';

const Page: React.FC = () => {
  const [{ isLoading: authIsLoading, signedIn, signingIn, user, twitter }, { signIn }] = useAuth();
  const authUid = user?.uid ?? null;

  const [currentUid, setCurrentUid] = useState(authUid);
  useEffect(() => {
    setCurrentUid(authUid);
  }, [authUid]);

  const [{ isLoading: userIsLoading, lastRunnedGetFollowers }] = useUser(currentUid);
  const [{ users: accounts }] = useMultiUsers(authUid);
  const [{ isFirstLoading, isFirstLoaded, isNextLoading, items, hasNext }, { getNextRecords }] = useRecords(currentUid);
  const [{ isLoading: tokenIsLoading, hasToken }] = useToken(currentUid);

  const recordsIsLoading = isFirstLoading || !isFirstLoaded;
  const isLoading = authIsLoading || recordsIsLoading || userIsLoading || tokenIsLoading;

  const authAccount = user && twitter ? { id: user.uid, twitter } : null;
  const multiAccounts = [authAccount, ...accounts].filter(
    (
      account
    ): account is {
      id: string;
      twitter: UserData['twitter'];
    } => account !== null
  );
  const currentAccount = multiAccounts.find((account) => account?.id === currentUid) || null;

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
            currentAccount,
            multiAccounts,
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
