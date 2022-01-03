import React from 'react';
import { BottomNav } from '../../organisms/BottomNav';
import { SettingsMenu } from '../../organisms/SettingsMenu';
import styles from './styles.module.scss';

export type SettingsPageProps = {
  signIn: () => void;
  signOut: () => void | Promise<void>;
};

export const SettingsPage: React.FC<SettingsPageProps> = ({ signIn, signOut }) => {
  return (
    <div className={styles.wrapper}>
      <section className={styles.section}>
        <SettingsMenu signIn={signIn} signOut={signOut} />
      </section>
      <BottomNav active="settings" />
    </div>
  );
};
