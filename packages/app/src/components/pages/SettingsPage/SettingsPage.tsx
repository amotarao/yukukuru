import { BottomNav } from '../../organisms/BottomNav';
import { SettingsMenu } from '../../organisms/SettingsMenu';

export type SettingsPageProps = {
  signIn: () => void;
  signOut: () => void | Promise<void>;
};

export const SettingsPage: React.FC<SettingsPageProps> = ({ signIn, signOut }) => {
  return (
    <div className="max-w-md sm:max-w-xl mx-auto pt-4 pb-16">
      <SettingsMenu signIn={signIn} signOut={signOut} />
      <BottomNav active="settings" />
    </div>
  );
};
