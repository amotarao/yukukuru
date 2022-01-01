/** @jsxImportSource @emotion/react */
import Button from '@material-ui/core/Button';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { DummyUserCard } from '../../organisms/UserCard';
import myPageStyles from '../MyPage/styles.module.scss';
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
        <Link href="/my" passHref>
          <Button css={style.button} variant="outlined" color="primary">
            マイページ・ログイン
          </Button>
        </Link>
        <p css={style.caution}>
          現在、フォロワー数1万人以上のアカウントの
          <wbr />
          新規登録を停止しています。
          <wbr />
          (2021.5.8)
        </p>
        <p css={style.caution}>
          ツイートする権限はありませんので
          <wbr />
          安心してご利用ください
        </p>
        <p css={style.caution}>※ 不具合が発生する場合があります</p>
      </section>
      <section className={myPageStyles.homeArea} css={style.example}>
        <p className={myPageStyles.recordHead}>こんな感じで表示します</p>
        <section className={myPageStyles.userSection} data-type="yuku">
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
        <section className={myPageStyles.userSection} data-type="kuru">
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
