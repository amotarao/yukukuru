import { FirestoreIdData, RecordData } from '@yukukuru/types';
import classNames from 'classnames';
import React, { useState, useEffect } from 'react';
import { useRecords } from '../../../hooks/records';
import * as gtag from '../../../libs/gtag';
import { LastUpdatedText } from '../../atoms/LastUpdatedText';
import { LoadingCircle } from '../../atoms/LoadingCircle';
import { BottomNav, NavType } from '../../organisms/BottomNav';
import { ErrorWrapper } from '../../organisms/ErrorWrapper';
import { NotificationList } from '../../organisms/NotificationList';
import { SettingMenu } from '../../organisms/SettingMenu';
import { UserCard } from '../../organisms/UserCard';
import styles from './styles.module.scss';

export type MyPageProps = {
  isLoading: boolean;
  isNextLoading: boolean;
  items: FirestoreIdData<RecordData>[];
  hasNext: boolean;
  hasToken: boolean;
  lastRunnedGetFollowers: Date;
  getNextRecords: ReturnType<typeof useRecords>[1]['getNextRecords'];
  signIn: () => void;
  signOut: () => void | Promise<void>;
};

/**
 * アイテムがないことを表示するコンポーネント
 */
const NoItem: React.FC = () => {
  return (
    <div className={styles.noticeWrapper}>
      <p className={styles.noticeText}>最初のデータ取得までしばらくお待ちください。</p>
      <p className={styles.noticeText}>
        現在、フォロワー数1万人以上のアカウントの
        <wbr />
        新規登録を停止しています。
        <wbr />
        (2021.5.8)
      </p>
    </div>
  );
};

/**
 * 表示するデータがないことを表示するコンポーネント
 */
const NoViewItem: React.FC<Pick<MyPageProps, 'lastRunnedGetFollowers'>> = ({ lastRunnedGetFollowers }) => {
  return (
    <div className={styles.noticeWrapper}>
      <p className={styles.noticeText}>
        データの取得は完了していますが、
        <wbr />
        今のところフォロワーの増減がありません。
      </p>
      <LastUpdatedText className={styles.noticeText} date={lastRunnedGetFollowers} />
    </div>
  );
};

/**
 * メインエリア
 */
const Home: React.FC<Pick<MyPageProps, 'items' | 'lastRunnedGetFollowers'>> = ({ items, lastRunnedGetFollowers }) => {
  if (items.length === 0) {
    // lastRunnedGetFollowers が 0 の場合、watches 取得処理が1回も完了していない
    if (lastRunnedGetFollowers.getTime() === 0) {
      return <NoItem />;
    }
    return <NoViewItem lastRunnedGetFollowers={lastRunnedGetFollowers} />;
  }

  let currentDate = '';

  return (
    <div className={styles.homeArea}>
      <nav className={styles.labelNav}>
        <ul className="flex justify-between sm:justify-around">
          <li
            className="inline-block px-3 py-1 rounded sm:rounded-full border-l-4 border-l-yuku sm:border-l-0 bg-white sm:bg-yuku text-xs"
            data-type="yuku"
          >
            ゆくひと
          </li>
          <li
            className="inline-block px-3 py-1 rounded sm:rounded-full border-r-4 border-r-kuru sm:border-r-0 bg-white sm:bg-kuru text-xs"
            data-type="kuru"
          >
            くるひと
          </li>
        </ul>
      </nav>
      <div className={[styles.noticeWrapper, styles.homeNotice].join(' ')}>
        <LastUpdatedText className={styles.noticeText} date={lastRunnedGetFollowers} />
      </div>
      {items.map((item) => {
        const date = item.data.durationEnd.toDate();
        const dateText = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
        const showDate = currentDate !== dateText;
        currentDate = dateText;

        return (
          <React.Fragment key={item.id}>
            {showDate && (
              <h2
                className={classNames(
                  'w-fit mx-auto my-2 mb-4 sm:my-2 px-4 py-1 rounded-full bg-primary text-back text-center text-xs tracking-widest',
                  styles.recordHead
                )}
              >
                {dateText}
              </h2>
            )}
            <section className={styles.userSection} data-type={item.data.type}>
              <UserCard {...item.data} />
            </section>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/**
 * マイページ全体のコンポーネント
 */
export const MyPage: React.FC<MyPageProps> = ({
  isLoading,
  isNextLoading,
  items,
  hasNext,
  hasToken,
  lastRunnedGetFollowers,
  getNextRecords,
  signIn,
  signOut,
}) => {
  const [nav, setNav] = useState<NavType>('home');
  const [paging, setPaging] = useState<number>(1);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    document.documentElement.style.overflow = nav !== 'home' ? 'hidden' : '';
  }, [nav]);

  useEffect(() => {
    if (isLoading || isNextLoading) {
      return;
    }

    gtag.event({
      action: 'element_show',
      category: 'has_next',
      label: hasNext ? `has_next_p-${paging}` : `has_not_next_p-${paging}`,
      value: 100,
    });
  }, [isLoading, isNextLoading, hasNext, paging]);

  const getNext = () => {
    getNextRecords();
    gtag.event({
      action: 'button_click',
      category: 'click_next',
      label: `click_next_p-${paging}`,
      value: 100,
    });
    setPaging(paging + 1);
  };

  const superReload = () => {
    window.location.replace(window.location.href);
  };

  return (
    <div className={styles.wrapper}>
      {!isLoading && !hasToken && (
        <ErrorWrapper onClick={superReload}>
          <p>ログアウトし、再度ログインしてください。</p>
          <p>解消しない場合はこちらをタップしてください。</p>
        </ErrorWrapper>
      )}
      <main className={styles.main}>
        {isLoading ? (
          <LoadingCircle />
        ) : (
          <>
            <Home items={items} lastRunnedGetFollowers={lastRunnedGetFollowers} />
            {!isLoading && isNextLoading && <LoadingCircle />}
            {!isLoading && hasNext && (
              <button className={styles.getNextButton} disabled={isNextLoading} onClick={getNext}>
                続きを取得
              </button>
            )}
          </>
        )}
      </main>
      {nav === 'notification' && (
        <section className={styles.section}>
          <NotificationList />
        </section>
      )}
      {nav === 'setting' && (
        <section className={styles.section}>
          <SettingMenu signIn={signIn} signOut={signOut} />
        </section>
      )}
      <BottomNav active={nav} onChange={setNav} />
    </div>
  );
};
