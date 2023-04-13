import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Head from 'next/head';
import { SupporterPage } from '../../components/pages/SupporterPage';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_KEY as string);

const Page: React.FC = () => {
  return (
    <>
      <Head>
        <title>ゆくくるサポーター - ゆくくる</title>
      </Head>
      <Elements stripe={stripePromise}>
        <SupporterPage />
      </Elements>
    </>
  );
};

export default Page;
