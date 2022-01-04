import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Head from 'next/head';
import React from 'react';
import { LoadingCircle } from '../../components/atoms/LoadingCircle';
import { SupporterPage } from '../../components/pages/SupporterPage';
import { useAuth } from '../../hooks/auth';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_KEY as string);

const Page: React.FC = () => {
  const [{ isLoading, user }] = useAuth();

  return (
    <>
      <Head>
        <title>ゆくくるサポーター - ゆくくる alpha</title>
      </Head>
      <Elements stripe={stripePromise}>
        {isLoading ? <LoadingCircle /> : <SupporterPage uid={user?.uid ?? null} />}
      </Elements>
    </>
  );
};

export default Page;
