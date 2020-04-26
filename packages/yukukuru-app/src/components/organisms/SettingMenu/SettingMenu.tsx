/** @jsx jsx */
import { jsx } from '@emotion/core';
import Switch from '@material-ui/core/Switch';
import { AuthContainer } from '../../../store/auth';
import { ThemeContainer } from '../../../store/theme';
import { TweetButton } from '../TweetButton';
import { style } from './style';

export const SettingMenu: React.FC = (props) => {
  const { signOut } = AuthContainer.useContainer();
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
          <button css={style.card} onClick={signOut}>
            <p>ログアウト</p>
          </button>
        </li>
      </ul>
      <div css={style.twitter}>
        <a href="https://twitter.com/intent/follow?screen_name=yukukuruapp">公式Twitterをフォローする @yukukuruapp</a>
        <TweetButton size="large" />
      </div>
    </>
  );
};
