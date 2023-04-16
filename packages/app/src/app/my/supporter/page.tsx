import { Metadata } from 'next';
import { BottomNav } from '../../../components/organisms/BottomNav';
import { SupporterPage } from './SupporterPage';
import Stripe from './stripe';

export const metadata: Metadata = {
  title: 'ゆくくるサポーター - ゆくくる',
};

const Page: React.FC = () => {
  return (
    <>
      <Stripe>
        <SupporterPage />
      </Stripe>
      <BottomNav active="supporter" scrollToTopOnActive />
    </>
  );
};

export default Page;
