import Head from 'next/head';
import { useEffect, useState } from 'react';
import { LoadingCircle } from '../../components/atoms/LoadingCircle';
import { LoginPage } from '../../components/pages/LoginPage';
import { MyPage } from '../../components/pages/MyPage';
import { useAuth } from '../../hooks/auth';
import { useMultiAccounts } from '../../hooks/multiAccounts';
import { useRecords } from '../../hooks/records';
import { useToken } from '../../hooks/token';
import { useUser } from '../../hooks/user';
import { setLastViewing } from '../../modules/firestore/userStatuses';

const Page: React.FC = () => {
  const [{ isLoading: authIsLoading, signedIn, signingIn, uid: authUid }, { signIn }] = useAuth();

  const [currentUid, setCurrentUid] = useState(authUid);
  useEffect(() => {
    setCurrentUid(authUid);
  }, [authUid]);

  const [{ isLoading: userIsLoading, lastRun }] = useUser(currentUid);
  const [{ isFirstLoading, isFirstLoaded, isNextLoading, records, hasNext }, { getNextRecords }] =
    useRecords(currentUid);
  const [{ isLoading: tokenIsLoading, hasToken }] = useToken(currentUid);
  const [{ accounts: multiAccounts }] = useMultiAccounts(authUid);

  const recordsIsLoading = isFirstLoading || !isFirstLoaded;
  const isLoading = authIsLoading || recordsIsLoading || userIsLoading || tokenIsLoading;

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
            lastRun: lastRun,
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
