import { PageHeader } from '../PageHeader';
import { BottomNav } from '../organisms/BottomNav';
import { SettingsMenu } from '../organisms/SettingsMenu';

export type SettingsPageProps = {
  signIn: () => void;
  signOut: () => void | Promise<void>;
};

export const SettingsPage: React.FC<SettingsPageProps> = ({ signIn, signOut }) => {
  return (
    <div className="mx-auto max-w-md pb-40 sm:max-w-xl">
      <PageHeader>設定</PageHeader>
      <SettingsMenu signIn={signIn} signOut={signOut} />
      <BottomNav active="settings" scrollToTopOnActive />
    </div>
  );
};
