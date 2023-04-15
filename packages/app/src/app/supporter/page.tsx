import Head from 'next/head';
import { BottomNav } from '../../components/organisms/BottomNav';
import { SupporterPage } from '../../components/pages/SupporterPage';
import Stripe from './stripe';

const Page: React.FC = () => {
  return (
    <>
      <Head>
        <title>ゆくくるサポーター - ゆくくる</title>
      </Head>
      <Stripe>
        <SupporterPage />
      </Stripe>
      {<BottomNav active="supporter" scrollToTopOnActive />}
    </>
  );
};

export default Page;
