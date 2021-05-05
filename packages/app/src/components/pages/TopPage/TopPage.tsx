/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import Button from '@material-ui/core/Button';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { DummyUserCard } from '../../organisms/UserCard';
import { style as myPageStyle } from '../../pages/MyPage/style';
import { style } from './style';

export const TopPage: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    document.documentElement.style.overflow = '';
  }, []);

  return (
    <div css={style.wrapper}>
      <section css={style.name}>
        <h1 css={style.title}>ゆくくる alpha</h1>
        <p css={style.text}>フォロワーがいつきたか・いなくなったかを記録します</p>
        <Link href="/my?login" passHref>
          <Button css={style.button} variant="outlined" color="primary">
            マイページ・ログイン
          </Button>
        </Link>
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
