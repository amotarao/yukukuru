/** @jsx jsx */
import { jsx } from '@emotion/core';
import Button, { ButtonProps } from '@material-ui/core/Button';
import { useRouter } from 'next/router';
import React from 'react';
import { AuthStoreType } from '../../../store/auth';
import { ThemeType } from '../../../store/theme';
import { TweetButton } from '../../organisms/TweetButton';
import { style } from './style';
import * as style2 from './style2';

export interface TopPageProps {
  isLoading: AuthStoreType['isLoading'];
  signingIn: AuthStoreType['signingIn'];
  signedIn: AuthStoreType['signedIn'];
  signIn: AuthStoreType['signIn'];
  theme: ThemeType;
}

export const MyButton: React.FC<Pick<TopPageProps, 'isLoading' | 'signingIn' | 'signedIn' | 'signIn'>> = (props) => {
  const router = useRouter();
  const toMyPage = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault;
    router.push('/my');
  };

  const baseProps: ButtonProps = {
    css: style.button,
    variant: 'outlined',
    color: 'primary',
  };

  if (props.isLoading)
    return (
      <Button {...baseProps} disabled={true}>
        読み込み中
      </Button>
    );
  if (props.signingIn)
    return (
      <Button {...baseProps} disabled={true}>
        ログイン処理中
      </Button>
    );
  if (props.signedIn)
    return (
      <Button {...baseProps} href="/my" onClick={toMyPage}>
        マイページ
      </Button>
    );
  return (
    <Button {...baseProps} onClick={props.signIn}>
      Twitter連携して始める
    </Button>
  );
};

export const TopPage: React.FC<TopPageProps> = (props) => {
  return (
    <div css={style2.wrapper}>
      <section css={style2.inner}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 'normal', marginBottom: 16 }}>ゆくくる alpha</h1>
        <p style={{ fontSize: '0.8em', marginBottom: 16 }}>あなたのフォロワーを管理します</p>
        <div css={style2.image}>
          {props.theme !== 'dark' ? (
            <img src="/image_default.jpg" alt="利用イメージ" />
          ) : (
            <img src="/image_dark.jpg" alt="利用イメージ" />
          )}
        </div>
        <MyButton {...props} />
        <p
          style={{
            fontSize: '0.6em',
            marginTop: 16,
            color: '#999',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <span style={{ whiteSpace: 'nowrap' }}>※ 現在テスト版のため不具合が発生する場合があります。</span>
        </p>
        <p
          style={{
            fontSize: '0.6em',
            marginTop: 4,
            marginBottom: 8,
            color: '#999',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <span style={{ whiteSpace: 'nowrap' }}>※ データ取得までに時間が掛かります。</span>
          <span style={{ whiteSpace: 'nowrap' }}>気長にお待ちください。</span>
        </p>
        <div css={style2.socialButtons}>
          <TweetButton />
        </div>
      </section>
    </div>
  );
};
