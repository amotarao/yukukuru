import { Metadata } from 'next';
import { BottomNav } from '../../../../components/organisms/BottomNav';
import { LinkAccountsPage } from './LinkAccountsPage';

export const metadata: Metadata = {
  title: 'アカウント連携 - ゆくくる',
};

export default function Page() {
  return (
    <>
      <LinkAccountsPage />
      <BottomNav active="settings" />
    </>
  );
}
