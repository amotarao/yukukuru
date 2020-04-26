/** @jsx jsx */
import { jsx } from '@emotion/core';
import { style } from './style';

export const BottomNav: React.FC = (props) => {
  return (
    <nav css={style.nav}>
      <p>
        データが正常に表示されていないなどのお問い合わせは、
        <a href="https://twitter.com/yukukuruapp">Twitterからリプライ・DMにて</a>
        お知らせください
      </p>
    </nav>
  );
};
