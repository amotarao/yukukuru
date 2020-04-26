import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { AuthContainer } from '../store/auth';
import { TopPage, TopPageProps } from '../components/pages/TopPage';

const Inner: React.FC = () => {
  const router = useRouter();

  const { signIn, signedIn, signingIn } = AuthContainer.useContainer();

  if (signedIn) {
    router.replace('/my');
  }

  const props: TopPageProps = {
    signIn,
    signingIn,
  };

  return <TopPage {...props} />;
};

const Page: React.FC = () => {
  return (
    <>
      <Head>
        <title>ゆくくる</title>
      </Head>
      <Inner />
    </>
  );
};

export default Page;
