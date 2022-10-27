import classNames from 'classnames';
import Link from 'next/link';
import styles from './styles.module.scss';

const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export type LoginPageProps = {
  signIn: () => void;
};

/**
 * マイページ全体のコンポーネント
 */
export const LoginPage: React.FC<LoginPageProps> = ({ signIn }) => {
  return (
    <div className={classNames('text-center', styles.wrapper)}>
      <div>
        <button
          className="mb-4 inline-block rounded border border-primary px-4 py-1 text-primary"
          onClick={() => {
            signIn();
          }}
        >
          {isTouchDevice() && <span>タップして</span>}ログイン
        </button>
      </div>
      <div>
        <Link href="/">
          <a className="mb-4 inline-block rounded border border-sub px-4 py-1 text-sub">トップページ</a>
        </Link>
      </div>
    </div>
  );
};
