import { FirestoreIdData, UserData, RecordData } from '@yukukuru/types';
import classNames from 'classnames';
import React, { useState, useEffect } from 'react';
import { useRecords } from '../../../hooks/records';
import * as gtag from '../../../libs/gtag';
import { LastUpdatedText } from '../../atoms/LastUpdatedText';
import { LoadingCircle } from '../../atoms/LoadingCircle';
import { AccountSelector } from '../../organisms/AccountSelector';
import { BottomNav } from '../../organisms/BottomNav';
import { ErrorWrapper } from '../../organisms/ErrorWrapper';
import { UserCard } from '../../organisms/UserCard';
import styles from './styles.module.scss';

export type MyPageProps = {
  isLoading: boolean;
  isNextLoading: boolean;
  items: FirestoreIdData<RecordData>[];
  hasNext: boolean;
  hasToken: boolean;
  lastRunnedGetFollowers: Date;
  twitter: UserData['twitter'] | null;
  getNextRecords: ReturnType<typeof useRecords>[1]['getNextRecords'];
  changeCurrentUid: (uid: string) => void;
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
const Home: React.FC<Pick<MyPageProps, 'items' | 'lastRunnedGetFollowers' | 'twitter' | 'changeCurrentUid'>> = ({
  items,
  lastRunnedGetFollowers,
  twitter,
  changeCurrentUid,
}) => {
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
      <nav className="sticky top-0 z-10 flex w-full -mb-12 sm:-mb-16 px-4 py-3 sm:py-5 pointer-events-none">
        <ul className="flex justify-between sm:justify-around w-full">
          <li className="inline-block px-3 py-1 sm:mr-8 rounded sm:rounded-full border-l-4 border-l-yuku sm:border-l-0 bg-back sm:bg-yuku text-xs shadow-sm shadow-shadow">
            ゆくひと
          </li>
          <li className="inline-block px-3 py-1 sm:ml-8 rounded sm:rounded-full border-r-4 border-r-kuru sm:border-r-0 bg-back sm:bg-kuru text-xs shadow-sm shadow-shadow">
            くるひと
          </li>
        </ul>
      </nav>
      <AccountSelector
        className="sticky top-0 z-10 h-12 sm:h-16 py-2 sm:py-3"
        screenName={twitter?.screenName ?? undefined}
        imageSrc={twitter?.photoUrl ?? undefined}
        change={changeCurrentUid}
      />
      <LastUpdatedText className="my-3 sm:my-4 text-center text-xs text-sub" date={lastRunnedGetFollowers} />
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
  twitter,
  getNextRecords,
  changeCurrentUid,
}) => {
  const [paging, setPaging] = useState<number>(1);

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
            <Home
              items={items}
              lastRunnedGetFollowers={lastRunnedGetFollowers}
              twitter={twitter}
              changeCurrentUid={changeCurrentUid}
            />
            {!isLoading && isNextLoading && <LoadingCircle />}
            {!isLoading && hasNext && (
              <button className={styles.getNextButton} disabled={isNextLoading} onClick={getNext}>
                続きを取得
              </button>
            )}
          </>
        )}
      </main>
      <BottomNav active="my" />
    </div>
  );
};
