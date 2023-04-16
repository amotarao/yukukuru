import { Metadata } from 'next';
import { PageHeader } from '../../../components/PageHeader';
import { BottomNav } from '../../../components/organisms/BottomNav';
import { SettingsMenu } from '../../../components/organisms/SettingsMenu';

export const metadata: Metadata = {
  title: '設定 - ゆくくる',
};

export default function Page() {
  return (
    <>
      <div className="mx-auto max-w-md pb-40 sm:max-w-xl">
        <PageHeader>設定</PageHeader>
        <SettingsMenu />
      </div>
      <BottomNav active="settings" scrollToTopOnActive />
    </>
  );
}
