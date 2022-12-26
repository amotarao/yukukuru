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
      <h1 className="mb-4">
        <span className="mb-2 block text-3xl">ゆくくる beta</span>
        <span className="block">マイページログイン</span>
      </h1>
      <div className="mb-4">
        <p className="mb-4 flex flex-wrap justify-center whitespace-nowrap text-xs font-bold text-sub">
          [2022.12] iOSでログインできない場合、
          <wbr />
          Chromeかパソコン等をご利用ください。
          <br />
          Twitter側の不具合と思われます。
        </p>
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
        <Link className="inline-block rounded border border-sub px-4 py-1 text-sub" href="/">
          トップページ
        </Link>
      </div>
    </div>
  );
};
