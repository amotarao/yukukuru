import React from 'react';
import { BottomNav } from '../../organisms/BottomNav';
import { SettingMenu } from '../../organisms/SettingMenu';
import styles from './styles.module.scss';

export type SettingsPageProps = {
  signIn: () => void;
  signOut: () => void | Promise<void>;
};

export const SettingsPage: React.FC<SettingsPageProps> = ({ signIn, signOut }) => {
  return (
    <div className={styles.wrapper}>
      <section className={styles.section}>
        <SettingMenu signIn={signIn} signOut={signOut} />
      </section>
      <BottomNav active="settings" />
    </div>
  );
};
