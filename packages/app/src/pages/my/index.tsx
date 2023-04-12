import Head from 'next/head';
import { useEffect, useState } from 'react';
import { LoadingCircle } from '../../components/atoms/LoadingCircle';
import { LoginPage } from '../../components/pages/LoginPage';
import { MyPage } from '../../components/pages/MyPage';
import { useAuth } from '../../hooks/auth';
import { useRecords } from '../../hooks/records';
import { useToken } from '../../hooks/token';
import { useLastRun } from '../../hooks/useLastRun';
import { useMultiAccounts } from '../../hooks/useMultiAccounts';
import { setLastViewing } from '../../modules/firestore/userStatuses';

const Page: React.FC = () => {
  const [{ isLoading: authIsLoading, signedIn, signingIn, uid: authUid }, { signIn }] = useAuth();

  const [currentUid, setCurrentUid] = useState(authUid);
  useEffect(() => {
    setCurrentUid(authUid);
  }, [authUid]);

  const [{ isLoading: userIsLoading, lastRun }] = useLastRun(currentUid);
  const [{ isFirstLoading, isFirstLoaded, isNextLoading, records, hasNext }, { getNextRecords }] =
    useRecords(currentUid);
  const [{ isLoading: tokenIsLoading, hasToken }] = useToken(currentUid);
  const [{ isLoading: isLoadingMultiAccounts, accounts: multiAccounts, currentAccount }] = useMultiAccounts(
    authUid,
    currentUid
  );

  const recordsIsLoading = isFirstLoading || !isFirstLoaded;
  const isLoading = authIsLoading || recordsIsLoading || userIsLoading || tokenIsLoading || isLoadingMultiAccounts;

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
        <title>マイページ - ゆくくる beta</title>
      </Head>
      {authIsLoading || signingIn ? (
        <LoadingCircle />
      ) : signedIn ? (
        <MyPage
          {...{
            isLoading,
            isNextLoading,
            records,
            hasNext,
            hasToken,
            lastRun,
            currentAccount,
            multiAccounts,
            getNextRecords,
            onChangeCurrentUid: (uid) => {
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
