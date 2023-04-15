import Head from 'next/head';
import { useEffect, useState } from 'react';
import { LoadingCircle } from '../../components/atoms/LoadingCircle';
import { BottomNav } from '../../components/organisms/BottomNav';
import { LoginPage } from '../../components/pages/LoginPage';
import { MyPage } from '../../components/pages/MyPage';
import { useMultiAccounts } from '../../hooks/useMultiAccounts';
import { useRecords } from '../../hooks/useRecords';
import { useToken } from '../../hooks/useToken';
import { useAuth } from '../../lib/auth/hooks';
import { setLastViewing } from '../../modules/firestore/userStatuses';

const Page: React.FC = () => {
  const { isLoading: authIsLoading, signedIn, signingIn, uid: authUid, signIn } = useAuth();

  const [currentUid, setCurrentUid] = useState<string | null>(null);
  useEffect(() => {
    setCurrentUid(authUid);
  }, [authUid]);

  const { isFirstLoading, isFirstLoaded, isNextLoading, isLoadingLastRun, records, hasNext, lastRun, getNextRecords } =
    useRecords(currentUid);
  const { isLoading: tokenIsLoading, hasToken } = useToken(currentUid);
  const {
    isLoading: isLoadingMultiAccounts,
    accounts: multiAccounts,
    currentAccount,
  } = useMultiAccounts(authUid, currentUid);

  const recordsIsLoading = isFirstLoading || !isFirstLoaded;
  const isLoading = authIsLoading || recordsIsLoading || isLoadingLastRun || tokenIsLoading || isLoadingMultiAccounts;

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
        <title>マイページ - ゆくくる</title>
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
      <BottomNav active="my" scrollToTopOnActive />
    </>
  );
};

export default Page;
