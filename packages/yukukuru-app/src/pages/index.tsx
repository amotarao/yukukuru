import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { AuthContainer } from '../store/auth';
import { ThemeContainer } from '../store/theme';
import { TopPage, TopPageProps } from '../components/pages/TopPage';

const Inner: React.FC = () => {
  const router = useRouter();

  const { theme } = ThemeContainer.useContainer();
  const { isLoading, signIn, signedIn, signingIn } = AuthContainer.useContainer();

  useEffect(() => {
    if (!isLoading && signedIn) {
      router.replace('/my');
    }
  }, [router, signedIn, isLoading]);

  const props: TopPageProps = {
    isLoading,
    signIn,
    signedIn,
    signingIn,
    theme,
  };

  return <TopPage {...props} />;
};

const Page: React.FC = () => {
  return (
    <>
      <Head>
        <title>ゆくくる alpha develop</title>
      </Head>
      <Inner />
    </>
  );
};

export default Page;
