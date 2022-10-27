import { BottomNav } from '../../organisms/BottomNav';
import { SettingsMenu } from '../../organisms/SettingsMenu';

export type SettingsPageProps = {
  signIn: () => void;
  signOut: () => void | Promise<void>;
};

export const SettingsPage: React.FC<SettingsPageProps> = ({ signIn, signOut }) => {
  return (
    <div className="mx-auto max-w-md pt-4 pb-16 sm:max-w-xl">
      <SettingsMenu signIn={signIn} signOut={signOut} />
      <BottomNav active="settings" />
    </div>
  );
};
