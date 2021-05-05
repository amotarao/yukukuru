import Head from 'next/head';
import React, { useEffect } from 'react';
import { LoadingCircle } from '../../components/atoms/LoadingCircle';
import { LoginPage } from '../../components/pages/LoginPage';
import { MyPage, MyPageProps } from '../../components/pages/MyPage';
import { AuthContainer } from '../../store/auth';
import { RecordsContainer } from '../../store/database/records';
import { TokenContainer } from '../../store/database/token';

const Inner: React.FC = () => {
  const { isLoading: userIsLoading, signIn, signedIn, user, uid } = AuthContainer.useContainer();
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
    uid,
    getNextRecords,
  };

  return userIsLoading ? <LoadingCircle /> : signedIn ? <MyPage {...props} /> : <LoginPage signIn={signIn} />;
};

const Page: React.FC = () => {
  return (
    <AuthContainer.Provider>
      <RecordsContainer.Provider>
        <TokenContainer.Provider>
          <Head>
            <title>マイページ - ゆくくる alpha</title>
          </Head>
          <Inner />
        </TokenContainer.Provider>
      </RecordsContainer.Provider>
    </AuthContainer.Provider>
  );
};

export default Page;
