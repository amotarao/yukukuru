import HomeIcon from '@material-ui/icons/Home';
import SettingsIcon from '@material-ui/icons/Settings';
import Link from 'next/link';
import React from 'react';
import styles from './styles.module.scss';

export type NavType = 'my' | 'settings';

export type BottomNavProps = {
  active: NavType;
  onChange?: (nav: NavType) => void;
};

export const BottomNav: React.FC<BottomNavProps> = ({ active, onChange }) => {
  const onClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    const type = e.currentTarget.getAttribute('data-type') as NavType;

    // 同じページの場合、上部にスクロール
    if (type === active) {
      e.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }

    onChange && onChange(type);
  };

  return (
    <nav className="fixed left-0 bottom-0 z-20 w-full bg-back border-t border-t-shadow">
      <ul className="flex justify-center max-w-md sm:max-w-xl mx-auto">
        <li className="flex-auto w-1/2">
          <Link href="/my">
            <a className={styles.button} aria-current={active === 'my' && 'page'} data-type="my" onClick={onClick}>
              <HomeIcon className="text-2xl" />
              ホーム
            </a>
          </Link>
        </li>
        <li className="flex-auto w-1/2">
          <Link href="/settings">
            <a
              className={styles.button}
              aria-current={active === 'settings' && 'page'}
              data-type="settings"
              onClick={onClick}
            >
              <SettingsIcon className="text-2xl" />
              設定
            </a>
          </Link>
        </li>
      </ul>
    </nav>
  );
};
