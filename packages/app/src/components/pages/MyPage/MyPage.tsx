import { RecordData } from '@yukukuru/types';
import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';
import { useRecords } from '../../../hooks/records';
import * as gtag from '../../../libs/gtag';
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
  items: RecordData[];
  hasOnlyEmptyItems: boolean;
  hasNext: boolean;
  hasToken: boolean;
  lastRunnedGetFollowers: Date;
  getNextRecords: ReturnType<typeof useRecords>[1]['getNextRecords'];
  signOut: () => void | Promise<void>;
};

/**
 * 最終取得日時
 */
const LastUpdatedText: React.FC<Pick<MyPageProps, 'lastRunnedGetFollowers'>> = ({ lastRunnedGetFollowers }) => {
  const now = dayjs();
  const diff = now.diff(lastRunnedGetFollowers);

  let text = '';

  if (diff < 1000 * 60 * 60) {
    text = `${now.diff(lastRunnedGetFollowers, 'm')}分前`;
  } else if (diff < 1000 * 60 * 60 * 24) {
    text = `${now.diff(lastRunnedGetFollowers, 'h')}時間前`;
  } else {
    text = `${now.diff(lastRunnedGetFollowers, 'd')}日前`;
  }

  return (
    <p className={styles.noticeText}>
      最終取得：
      <wbr />
      {text}
    </p>
  );
};

/**
 * アイテムがないことを表示するコンポーネント
 */
const NoItem: React.FC = () => {
  return (
    <div className={styles.noticeWrapper}>
      <p className={styles.noticeText}>最初の取得までしばらくお待ちください。</p>
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
      <LastUpdatedText lastRunnedGetFollowers={lastRunnedGetFollowers} />
    </div>
  );
};

/**
 * メインエリア
 */
const Home: React.FC<Pick<MyPageProps, 'items' | 'hasOnlyEmptyItems' | 'lastRunnedGetFollowers'>> = ({
  items,
  hasOnlyEmptyItems,
  lastRunnedGetFollowers,
}) => {
  if (hasOnlyEmptyItems) {
    return <NoViewItem lastRunnedGetFollowers={lastRunnedGetFollowers} />;
  }
  if (items.length === 0) {
    return <NoItem />;
  }

  let currentDate = '';

  return (
    <div className={styles.homeArea}>
      <nav className={styles.labelNav}>
        <ul>
          <li data-type="yuku">ゆくひと</li>
          <li data-type="kuru">くるひと</li>
        </ul>
      </nav>
      <div className={styles.noticeWrapper} style={{ marginTop: -54 }}>
        <LastUpdatedText lastRunnedGetFollowers={lastRunnedGetFollowers} />
      </div>
      {items.map((item, itemIndex) => {
        const date = item.durationEnd.toDate();
        const dateText = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
        const showDate = currentDate !== dateText;
        currentDate = dateText;

        return (
          <React.Fragment key={itemIndex}>
            {showDate && <h2 className={styles.recordHead}>{dateText}</h2>}
            <section className={styles.userSection} data-type={item.type}>
              <UserCard {...item} />
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
  hasOnlyEmptyItems,
  hasNext,
  hasToken,
  lastRunnedGetFollowers,
  getNextRecords,
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
    window.location.reload(true);
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
            <Home items={items} hasOnlyEmptyItems={hasOnlyEmptyItems} lastRunnedGetFollowers={lastRunnedGetFollowers} />
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
          <SettingMenu signOut={signOut} />
        </section>
      )}
      <BottomNav active={nav} onChange={setNav} />
    </div>
  );
};
