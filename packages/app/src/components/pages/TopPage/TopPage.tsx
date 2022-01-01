import classNames from 'classnames';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { DummyUserCard } from '../../organisms/UserCard';
import myPageStyles from '../MyPage/styles.module.scss';
import styles from './styles.module.scss';

export const TopPage: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    document.documentElement.style.overflow = '';
  }, []);

  return (
    <div
      className={classNames(
        'flex flex-col justify-center items-center w-full h-screen min-h-max py-6 bg-top-bg',
        styles.wrapper
      )}
    >
      <section className="flex flex-col justify-center items-center gap-4 w-full p-8 bg-back-shadow text-center">
        <h1 className="text-3xl">ゆくくる alpha</h1>
        <p className="text-sm">フォロワーがいつきたか・いなくなったかを記録します</p>
        <Link href="/my" passHref>
          <a className="px-4 py-1 rounded border border-primary text-primary">マイページ・ログイン</a>
        </Link>
        <div className="flex flex-col gap-2">
          <p className="flex flex-wrap justify-center text-xs text-sub whitespace-nowrap">
            現在、フォロワー数1万人以上のアカウントの
            <wbr />
            新規登録を停止しています。
            <wbr />
            (2021.5.8)
          </p>
          <p className="flex flex-wrap justify-center text-xs text-sub whitespace-nowrap">
            ツイートする権限はありませんので
            <wbr />
            安心してご利用ください
          </p>
          <p className="flex flex-wrap justify-center text-xs text-sub whitespace-nowrap">
            ※ 不具合が発生する場合があります
          </p>
        </div>
      </section>
      <section className={classNames('mt-16 pb-8 w-full', styles.example, myPageStyles.homeArea)}>
        <p
          className={classNames(
            'w-fit mx-auto my-2 px-4 py-1 rounded-full bg-primary text-back text-center text-xs tracking-widest',
            myPageStyles.recordHead
          )}
        >
          こんな感じで表示します
        </p>
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
