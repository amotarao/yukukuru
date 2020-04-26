/** @jsx jsx */
import { jsx } from '@emotion/core';
import Button from '@material-ui/core/Button';
import React from 'react';
import { AuthStoreType } from '../../../store/auth';
import { style } from './style';

export interface TopPageProps {
  signIn: AuthStoreType['signIn'];
  signingIn: AuthStoreType['signingIn'];
}

export const TopPage: React.FC<TopPageProps> = (props) => {
  const signInDisabled = props.signingIn;

  return (
    <div css={style.container}>
      <main css={style.main}>
        <h1 css={style.title}>ゆくくる</h1>
        <Button css={style.button} variant="outlined" color="primary" disabled={signInDisabled} onClick={props.signIn}>
          {!props.signingIn ? 'Twitterログインして始める' : 'ログイン処理中'}
        </Button>
      </main>
    </div>
  );
};
