import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Head from 'next/head';
import { BottomNav } from '../../components/organisms/BottomNav';
import { SupporterPage } from '../../components/pages/SupporterPage';
import { useAuth } from '../../lib/auth/hooks';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_KEY as string);

const Page: React.FC = () => {
  const { signedIn } = useAuth();

  return (
    <>
      <Head>
        <title>ゆくくるサポーター - ゆくくる</title>
      </Head>
      <Elements stripe={stripePromise}>
        <SupporterPage />
      </Elements>
      {signedIn && <BottomNav active="supporter" scrollToTopOnActive />}
    </>
  );
};

export default Page;
