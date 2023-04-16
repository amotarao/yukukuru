import { Metadata } from 'next';
import { BottomNav } from '../../../components/organisms/BottomNav';
import { SupporterPage } from './SupporterPage';
import Stripe from './stripe';

export const metadata: Metadata = {
  title: 'ゆくくるサポーター - ゆくくる',
};

export default function Page() {
  return (
    <>
      <Stripe>
        <SupporterPage withAuth />
      </Stripe>
      <BottomNav active="supporter" scrollToTopOnActive />
    </>
  );
}
