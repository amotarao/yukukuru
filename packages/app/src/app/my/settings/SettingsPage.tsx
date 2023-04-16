import { PageHeader } from '../../../components/PageHeader';
import { SettingsMenu } from '../../../components/organisms/SettingsMenu';

export const SettingsPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-md pb-40 sm:max-w-xl">
      <PageHeader>設定</PageHeader>
      <SettingsMenu />
    </div>
  );
};
