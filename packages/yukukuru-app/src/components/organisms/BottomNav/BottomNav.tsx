/** @jsx jsx */
import { jsx } from '@emotion/core';
import HomeIcon from '@material-ui/icons/Home';
import NotificationsIcon from '@material-ui/icons/Notifications';
import SettingsIcon from '@material-ui/icons/Settings';
import { style } from './style';

export type NavType = 'home' | 'notification' | 'setting';

export interface BottomNavProps {
  active: NavType;
  onChange: (nav: NavType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = (props) => {
  return (
    <nav css={style.nav}>
      <ul css={style.list}>
        <li css={style.item}>
          <button
            css={style.button}
            aria-selected={props.active === 'home'}
            value="home"
            onClick={(e) => {
              props.onChange(e.currentTarget.value as NavType);
            }}
          >
            <HomeIcon />
            ホーム
          </button>
        </li>
        <li css={style.item}>
          <button
            css={style.button}
            aria-selected={props.active === 'notification'}
            value="notification"
            onClick={(e) => {
              props.onChange(e.currentTarget.value as NavType);
            }}
          >
            <NotificationsIcon />
            お知らせ
          </button>
        </li>
        <li css={style.item}>
          <button
            css={style.button}
            aria-selected={props.active === 'setting'}
            value="setting"
            onClick={(e) => {
              props.onChange(e.currentTarget.value as NavType);
            }}
          >
            <SettingsIcon />
            設定
          </button>
        </li>
      </ul>
      {/* <p>
        データが正常に表示されていないなどのお問い合わせは、
        <a href="https://twitter.com/yukukuruapp">Twitterからリプライ・DMにて</a>
        お知らせください
      </p> */}
    </nav>
  );
};
