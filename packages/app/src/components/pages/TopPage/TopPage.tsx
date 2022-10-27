import classNames from 'classnames';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { dateOptions } from '../../../modules/date';
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
        'flex h-screen min-h-max w-full flex-col items-center justify-center bg-top-bg py-6',
        styles.wrapper
      )}
    >
      <section className="flex w-full flex-col items-center justify-center gap-4 bg-back-shadow p-8 text-center">
        <h1 className="text-3xl">ゆくくる alpha</h1>
        <p className="text-sm">フォロワーがいつきたか・いなくなったかを記録します</p>
        <Link href="/my">
          <a className="rounded border border-primary px-4 py-1 text-primary">マイページ・ログイン</a>
        </Link>
        <div className="flex flex-col gap-2">
          <p className="flex flex-wrap justify-center whitespace-nowrap text-xs text-sub">
            現在、フォロワー数1万人以上のアカウントの
            <wbr />
            新規登録を停止しています。
            <wbr />({new Date('2021-05-08').toLocaleDateString(undefined, dateOptions)})
          </p>
          <p className="flex flex-wrap justify-center whitespace-nowrap text-xs text-sub">
            ツイートする権限はありませんので
            <wbr />
            安心してご利用ください
          </p>
          <p className="flex flex-wrap justify-center whitespace-nowrap text-xs text-sub">
            ※ 不具合が発生する場合があります
          </p>
        </div>
      </section>
      <section className={classNames('mt-16 w-full pb-8', styles.example, myPageStyles.homeArea)}>
        <p
          className={classNames(
            'mx-auto my-2 w-fit rounded-full bg-primary px-4 py-1 text-center text-xs tracking-widest text-back',
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
