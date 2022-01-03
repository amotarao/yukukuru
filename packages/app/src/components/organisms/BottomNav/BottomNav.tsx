/** @jsxImportSource @emotion/react */
import HomeIcon from '@material-ui/icons/Home';
import SettingsIcon from '@material-ui/icons/Settings';
import Link from 'next/link';
import React from 'react';
import { style } from './style';

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
    <nav css={style.nav}>
      <ul css={style.list}>
        <li css={style.item}>
          <Link href="/my">
            <a css={style.button} aria-selected={active === 'my'} data-type="my" onClick={onClick}>
              <HomeIcon />
              ホーム
            </a>
          </Link>
        </li>
        <li css={style.item}>
          <Link href="/settings">
            <a css={style.button} aria-selected={active === 'settings'} data-type="settings" onClick={onClick}>
              <SettingsIcon />
              設定
            </a>
          </Link>
        </li>
      </ul>
    </nav>
  );
};
