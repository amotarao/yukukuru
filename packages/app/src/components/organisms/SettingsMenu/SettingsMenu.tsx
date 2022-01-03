/** @jsxImportSource @emotion/react */
import Switch from '@material-ui/core/Switch';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { ThemeContainer } from '../../../store/theme';
import { TweetButton } from '../TweetButton';

type SettingsMenuProps = {
  signIn: () => void;
  signOut: () => void | Promise<void>;
};

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ signIn, signOut }) => {
  const router = useRouter();
  const { theme, setTheme } = ThemeContainer.useContainer();

  return (
    <>
      <ul>
        <li className="border-b border-b-back-2">
          <div className="flex items-center">
            <p className="grow block w-full px-4 py-3 text-left">ダークテーマ</p>
            <Switch
              className="mr-4"
              checked={theme === 'dark'}
              onChange={() => {
                setTheme(theme === 'dark' ? 'default' : 'dark');
              }}
              color="primary"
              inputProps={{ 'aria-label': 'ダークテーマにする' }}
            />
          </div>
        </li>
        <li className="border-b border-b-back-2">
          <Link href="/" passHref>
            <a
              className="grow block w-full px-4 py-3 text-left"
              onClick={async (e) => {
                e.preventDefault();
                await signOut();
                router.push('/');
              }}
            >
              <p>ログアウト</p>
            </a>
          </Link>
        </li>
        <li className="border-b border-b-back-2">
          <button
            className="grow block w-full px-4 py-3 text-left"
            onClick={async () => {
              await signIn();
            }}
          >
            <p>
              別のアカウントでログイン
              <span className="block mt-1 text-xs">Twitterでアカウントを切り替えたあとに実行</span>
            </p>
          </button>
        </li>
      </ul>
      <section className="mt-4 p-4">
        <p className="mb-4">
          <a
            className="text-primary no-underline"
            href="https://twitter.com/intent/follow?screen_name=yukukuruapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            公式Twitterをフォローする @yukukuruapp
          </a>
        </p>
        <p className="mb-4">
          <a
            className="text-primary no-underline"
            href="https://twitter.com/yukukuruapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            不具合はリプライかDMでお問い合わせください
          </a>
        </p>
        <p className="mb-4">
          <a
            className="text-primary no-underline"
            href="https://odaibako.net/u/yukukuruapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            お題箱でもご意見受付中！
          </a>
          (お題箱への書き込みは公開されます)
        </p>
        <TweetButton size="large" />
      </section>
    </>
  );
};
