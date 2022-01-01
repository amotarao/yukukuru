import classNames from 'classnames';
import Link from 'next/link';
import React from 'react';
import styles from './styles.module.scss';

const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
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
          className="inline-block mb-4 px-4 py-1 rounded border border-primary text-primary"
          variant="outlined"
          color="primary"
          onClick={() => {
            signIn();
          }}
        >
          {isTouchDevice() && <span>タップして</span>}ログイン
        </button>
      </div>
      <div>
        <Link href="/" passHref>
          <a className="inline-block mb-4 px-4 py-1 rounded border border-sub text-sub" variant="outlined">
            トップページ
          </a>
        </Link>
      </div>
    </div>
  );
};
