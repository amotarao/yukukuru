/** @jsxImportSource @emotion/react */
import Button from '@material-ui/core/Button';
import Link from 'next/link';
import React from 'react';
import { style } from './style';

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
    <div css={style.wrapper}>
      <div>
        <Button
          css={style.loginButton}
          variant="outlined"
          color="primary"
          onClick={() => {
            signIn();
          }}
        >
          {isTouchDevice() && <span>タップして</span>}ログイン
        </Button>
      </div>
      <div>
        <Link href="/" passHref>
          <Button css={style.topButton} variant="outlined">
            トップページ
          </Button>
        </Link>
      </div>
    </div>
  );
};
