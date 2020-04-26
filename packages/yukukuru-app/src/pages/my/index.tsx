import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { AuthContainer } from '../../store/auth';
import { RecordsContainer } from '../../store/database/records';
import { TokenContainer } from '../../store/database/token';
import { MyPage, MyPageProps } from '../../components/pages/MyPage';

const Inner: React.FC = () => {
  const router = useRouter();

  const { isLoading: userIsLoading, signedIn, user, signOut } = AuthContainer.useContainer();
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
  const { isLoading: tokenIsLoading, setUid: setTokenUid, hasToken } = TokenContainer.useContainer();

  useEffect(() => {
    if (!userIsLoading && !signedIn) {
      router.replace('/');
    }
  }, [router, signedIn, userIsLoading]);

  const isLoading = userIsLoading || recordsIsLoading || tokenIsLoading;

  useEffect(() => {
    if (user) {
      setRecordsUid(user.uid);
      setTokenUid(user.uid);
    }
  }, [user]);

  const props: MyPageProps = {
    isLoading,
    isNextLoading,
    items,
    hasItems,
    hasOnlyEmptyItems,
    hasNext,
    hasToken,
    getNextRecords,
    signOut,
  };

  return <MyPage {...props} />;
};

const Page: React.FC = () => {
  return (
    <RecordsContainer.Provider>
      <TokenContainer.Provider>
        <Head>
          <title>マイページ - ゆくくる alpha</title>
        </Head>
        <Inner />
      </TokenContainer.Provider>
    </RecordsContainer.Provider>
  );
};

export default Page;
