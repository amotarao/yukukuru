import { Metadata } from 'next';
import { BottomNav } from '../../../components/organisms/BottomNav';
import { SettingsPage } from './SettingsPage';

export const metadata: Metadata = {
  title: '設定 - ゆくくる',
};

const Page: React.FC = () => {
  return (
    <>
      <SettingsPage />
      <BottomNav active="settings" scrollToTopOnActive />
    </>
  );
};

export default Page;
