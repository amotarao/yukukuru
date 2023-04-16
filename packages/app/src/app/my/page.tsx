'use client';

import { useEffect, useState } from 'react';
import { BottomNav } from '../../components/organisms/BottomNav';
import { useMultiAccounts } from '../../hooks/useMultiAccounts';
import { useRecords } from '../../hooks/useRecords';
import { useToken } from '../../hooks/useToken';
import { useAuth } from '../../lib/auth/hooks';
import { setLastViewing } from '../../lib/firestore/userStatuses';
import { MyPage } from './MyPage';

const Page: React.FC = () => {
  const { isLoading: authIsLoading, uid: authUid } = useAuth();

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
      <BottomNav active="my" scrollToTopOnActive />
    </>
  );
};

export default Page;
