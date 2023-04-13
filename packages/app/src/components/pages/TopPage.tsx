import classNames from 'classnames';
import Link from 'next/link';
import { useEffect } from 'react';
import { pagesPath } from '../../lib/$path';
import { DummyUserCard } from '../organisms/UserCard';
import myPageStyles from './MyPage.module.scss';
import styles from './TopPage.module.scss';

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
        <h1 className="text-3xl">ゆくくる</h1>
        <p className="whitespace-nowrap text-sm">
          フォロワーがいつきたか・
          <wbr />
          いなくなったかを記録します
        </p>
        <Link className="rounded border border-primary px-4 py-1 text-primary" href={pagesPath.my.$url()}>
          マイページ・ログイン
        </Link>
        <div className="flex flex-col gap-2">
          <p className="flex flex-wrap justify-center whitespace-nowrap text-xs text-sub">
            ツイートする権限はありませんので
            <wbr />
            安心してご利用ください
          </p>
        </div>
      </section>
      <section className={classNames('mt-16 w-full pb-8', styles.example, myPageStyles.homeArea)}>
        <p
          className={classNames(
            'mx-auto my-4 w-fit rounded-full bg-primary px-4 py-1 text-center text-xs tracking-widest text-back',
            myPageStyles.recordHead
          )}
        >
          こんな感じで表示します
        </p>
        <section className={classNames('mb-4 px-4 sm:mb-6', myPageStyles.userSection)} data-type="yuku">
          <DummyUserCard
            className="w-11/12 max-w-[400px] self-start sm:w-[400px] sm:max-w-[calc(50%-40px)]"
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
        <section className={classNames('mb-4 px-4 sm:mb-6', myPageStyles.userSection)} data-type="kuru">
          <DummyUserCard
            className="w-11/12 max-w-[400px] self-end sm:w-[400px] sm:max-w-[calc(50%-40px)]"
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
