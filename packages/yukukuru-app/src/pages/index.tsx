import Head from 'next/head';
import React from 'react';
import { AuthContainer } from '../store/auth';
import { ThemeContainer } from '../store/theme';
import { TopPage, TopPageProps } from '../components/pages/TopPage';

const Inner: React.FC = () => {
  const { theme } = ThemeContainer.useContainer();
  const { isLoading, signIn, signedIn, signingIn } = AuthContainer.useContainer();

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
        <title>ゆくくる alpha</title>
      </Head>
      <Inner />
    </>
  );
};

export default Page;
