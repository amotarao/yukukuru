/** @jsxImportSource @emotion/react */
import Switch from '@material-ui/core/Switch';
import { useRouter } from 'next/router';
import React from 'react';
import { ThemeContainer } from '../../../store/theme';
import { TweetButton } from '../TweetButton';
import { style } from './style';

type SettingMenuProps = {
  signOut: () => void;
};

export const SettingMenu: React.FC<SettingMenuProps> = ({ signOut }) => {
  const router = useRouter();
  const { theme, setTheme } = ThemeContainer.useContainer();

  return (
    <>
      <ul css={style.list}>
        <li css={style.item}>
          <div css={style.card}>
            <p>ダークテーマ</p>
            <Switch
              checked={theme === 'dark'}
              onChange={() => {
                setTheme(theme === 'dark' ? 'default' : 'dark');
              }}
              color="primary"
              inputProps={{ 'aria-label': 'ダークテーマにする' }}
            />
          </div>
        </li>
        <li css={style.item}>
          <button
            css={style.card}
            onClick={() => {
              router.push('/');
              signOut();
            }}
          >
            <p>ログアウト</p>
          </button>
        </li>
        <li css={style.item}>
          <button
            css={style.card}
            onClick={() => {
              router.replace('/my?login');
              signOut();
            }}
          >
            <p>ログアウト・別のアカウントでログイン</p>
          </button>
        </li>
      </ul>
      <div css={style.twitter}>
        <p>
          <a href="https://twitter.com/intent/follow?screen_name=yukukuruapp" target="_blank" rel="noopener noreferrer">
            公式Twitterをフォローする @yukukuruapp
          </a>
        </p>
        <p>
          <a href="https://twitter.com/yukukuruapp" target="_blank" rel="noopener noreferrer">
            不具合はリプライかDMでお問い合わせください
          </a>
        </p>
        <p>
          <a href="https://odaibako.net/u/yukukuruapp" target="_blank" rel="noopener noreferrer">
            お題箱でもご意見受付中！
          </a>
          (お題箱への書き込みは公開されます)
        </p>
        <TweetButton size="large" />
      </div>
    </>
  );
};
