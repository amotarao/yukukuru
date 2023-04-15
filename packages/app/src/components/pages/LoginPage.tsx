import classNames from 'classnames';
import Link from 'next/link';
import { pagesPath } from '../../lib/$path';
import { useAuth } from '../../lib/auth/hooks';
import styles from './LoginPage.module.scss';

const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * マイページ全体のコンポーネント
 */
export const LoginPage: React.FC = () => {
  const { signIn } = useAuth();

  return (
    <div className={classNames('text-center', styles.wrapper)}>
      <h1 className="mb-4">
        <span className="mb-2 block text-3xl">ゆくくる</span>
        <span className="block">マイページログイン</span>
      </h1>
      <div className="mb-4">
        <button
          className="inline-block rounded border border-primary px-4 py-1 text-primary"
          onClick={() => {
            signIn();
          }}
        >
          {isTouchDevice() && <span>タップして</span>}ログイン
        </button>
      </div>
      <div className="mb-4">
        <Link className="inline-block rounded border border-sub px-4 py-1 text-sub" href={pagesPath.$url()}>
          トップページ
        </Link>
      </div>
    </div>
  );
};
