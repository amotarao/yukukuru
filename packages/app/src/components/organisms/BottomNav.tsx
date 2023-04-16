'use client';

import classNames from 'classnames';
import Link from 'next/link';
import { useCallback, useMemo } from 'react';
import { pagesPath } from '../../lib/$path';
import { Icon } from '../shared/Icon';

export type NavType = 'my' | 'supporter' | 'settings';

export type BottomNavProps = {
  active: NavType;
  scrollToTopOnActive?: boolean;
};

export const BottomNav: React.FC<BottomNavProps> = ({ active, scrollToTopOnActive }) => {
  const onClick = useCallback(
    (type: NavType): React.MouseEventHandler<HTMLAnchorElement> =>
      (e) => {
        if (scrollToTopOnActive && type === active) {
          e.preventDefault();
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
          return;
        }
      },
    [active, scrollToTopOnActive]
  );

  const menuItems = useMemo(
    () => [
      {
        type: 'my' as const,
        href: pagesPath.my.$url(),
        title: 'ホーム',
        icon: 'home' as const,
      },
      {
        type: 'supporter' as const,
        href: pagesPath.my.supporter.$url(),
        title: 'サポーター',
        icon: 'membership' as const,
      },
      {
        type: 'settings' as const,
        href: pagesPath.my.settings.$url(),
        title: '設定',
        icon: 'cog' as const,
      },
    ],
    []
  );

  return (
    <nav className="fixed left-0 bottom-0 z-20 w-full border-t border-t-shadow bg-back">
      <ul
        className={classNames(
          'mx-auto grid max-w-md justify-center sm:max-w-xl',
          menuItems.length === 3 && 'grid-cols-3'
        )}
      >
        {menuItems.map((item) => (
          <li key={item.type}>
            <Link
              className="flex w-full cursor-pointer appearance-none flex-col items-center justify-center border-0 bg-none pb-[calc(0.4rem+var(--safe-bottom))] pt-[0.4rem] font-default text-[0.6rem] text-sub focus:bg-primary-bg focus:outline-none aria-current:text-primary"
              href={item.href}
              aria-current={active === item.type && 'page'}
              onClick={onClick(item.type)}
            >
              <Icon className="text-2xl" type={item.icon} />
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
