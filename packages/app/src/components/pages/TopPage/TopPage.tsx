/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import Button, { ButtonProps } from '@material-ui/core/Button';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { AuthStoreType } from '../../../store/auth';
import { ThemeType } from '../../../store/theme';
import { DummyUserCard } from '../../organisms/UserCard';
import { style as myPageStyle } from '../../pages/MyPage/style';
import { style } from './style';

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
      ログイン
    </Button>
  );
};

export const TopPage: React.FC<TopPageProps> = (props) => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    document.documentElement.style.overflow = null;
  }, []);

  return (
    <div css={style.wrapper}>
      <section css={style.name}>
        <h1 css={style.title}>ゆくくる alpha</h1>
        <p css={style.text}>フォロワーがいつきたか・いなくなったかを記録します</p>
        <MyButton {...props} />
        <p css={style.caution}>現在、新規アカウント登録を停止しています。 (2021.5.4)</p>
      </section>
      <section
        css={css`
          ${style.example}
          ${myPageStyle.homeArea}
        `}
      >
        <p css={myPageStyle.recordHead}>こんな感じで表示します</p>
        <section css={myPageStyle.userSection} data-type="yuku">
          <DummyUserCard
            {...{
              user: {
                screenName: 'Twitter',
                displayName: 'Twitter',
                photoUrl: 'https://pbs.twimg.com/profile_images/1111729635610382336/_65QFl7B_400x400.png',
              },
              type: 'yuku',
              durationStart: '11:11',
              durationEnd: '12:34',
            }}
          />
        </section>
        <section css={myPageStyle.userSection} data-type="kuru">
          <DummyUserCard
            {...{
              user: {
                screenName: 'TwitterJP',
                displayName: 'Twitter Japan',
                photoUrl: 'https://pbs.twimg.com/profile_images/875091517198614528/eeNe_9Pc_400x400.jpg',
              },
              type: 'kuru',
              durationStart: '10:00',
              durationEnd: '11:11',
            }}
          />
        </section>
      </section>
    </div>
  );
};
