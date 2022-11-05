import Link from 'next/link';
import { Icon } from '../../shared/Icon';
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
    <nav className="fixed left-0 bottom-0 z-20 w-full border-t border-t-shadow bg-back">
      <ul className="mx-auto flex max-w-md justify-center sm:max-w-xl">
        <li className="w-1/2 flex-auto">
          <Link
            className={styles.button}
            href="/my"
            aria-current={active === 'my' && 'page'}
            data-type="my"
            onClick={onClick}
          >
            <Icon className="text-2xl" type="home" />
            ホーム
          </Link>
        </li>
        <li className="w-1/2 flex-auto">
          <Link
            className={styles.button}
            href="/settings"
            aria-current={active === 'settings' && 'page'}
            data-type="settings"
            onClick={onClick}
          >
            <Icon className="text-2xl" type="cog" />
            設定
          </Link>
        </li>
      </ul>
    </nav>
  );
};
