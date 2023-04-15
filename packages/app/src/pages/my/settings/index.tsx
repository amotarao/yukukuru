import Head from 'next/head';
import { LoadingCircle } from '../../../components/atoms/LoadingCircle';
import { LoginPage } from '../../../components/pages/LoginPage';
import { SettingsPage } from '../../../components/pages/SettingsPage';
import { useAuth } from '../../../lib/auth/hooks';

const Page: React.FC = () => {
  const { isLoading, signedIn, signingIn, signIn, signOut } = useAuth();

  return (
    <>
      <Head>
        <title>設定 - ゆくくる</title>
      </Head>
      {isLoading || signingIn ? (
        <LoadingCircle />
      ) : !signedIn ? (
        <LoginPage signIn={signIn} />
      ) : (
        <SettingsPage
          {...{
            signIn,
            signOut,
          }}
        />
      )}
    </>
  );
};

export default Page;
