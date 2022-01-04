import { FirestoreIdData, UserData, RecordData } from '@yukukuru/types';
import classNames from 'classnames';
import { logEvent } from 'firebase/analytics';
import React, { useState, useEffect } from 'react';
import { useRecords } from '../../../hooks/records';
import { dateOptions } from '../../../modules/date';
import { analytics } from '../../../modules/firebase';
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
  currentAccount: { id: string; twitter: UserData['twitter'] } | null;
  multiAccounts: { id: string; twitter: UserData['twitter'] }[];
  getNextRecords: ReturnType<typeof useRecords>[1]['getNextRecords'];
  onChangeCurrentUid: (uid: string) => void;
};

/**
 * アイテムがないことを表示するコンポーネント
 */
const NoItemView: React.FC = () => {
  return (
    <div>
      <p className="px-4 my-3 sm:my-4 text-center text-xs text-sub">最初のデータ取得までしばらくお待ちください。</p>
      <p className="px-4 my-3 sm:my-4 text-center text-xs text-sub">
        現在、フォロワー数1万人以上のアカウントの新規登録を停止しています。(
        {new Date('2021-05-08').toLocaleDateString(undefined, dateOptions)})
      </p>
    </div>
  );
};

/**
 * 表示するデータがないことを表示するコンポーネント
 */
const NoViewItemView: React.FC<Pick<MyPageProps, 'lastRunnedGetFollowers'>> = ({ lastRunnedGetFollowers }) => {
  return (
    <div>
      <p className="px-4 my-3 sm:my-4 text-center text-xs text-sub">
        データの取得は完了していますが、今のところフォロワーの増減がありません。
      </p>
      <LastUpdatedText className="px-4 my-3 sm:my-4 text-center text-xs text-sub" date={lastRunnedGetFollowers} />
    </div>
  );
};

/**
 * リストコンポーネント
 */
const ListView: React.FC<Pick<MyPageProps, 'items' | 'lastRunnedGetFollowers'>> = ({
  items,
  lastRunnedGetFollowers,
}) => {
  let currentDate = '';

  return (
    <div className="pb-10 sm:pb-20">
      <nav className="sticky top-0 z-10 flex w-full -mt-12 sm:-mt-16 px-4 py-3 sm:py-5 pointer-events-none">
        <ul className="flex justify-between sm:justify-around w-full">
          <li className="inline-block px-3 py-1 sm:mr-8 rounded sm:rounded-full border-l-4 border-l-yuku sm:border-l-0 bg-back sm:bg-yuku text-xs shadow-sm shadow-shadow">
            ゆくひと
          </li>
          <li className="inline-block px-3 py-1 sm:ml-8 rounded sm:rounded-full border-r-4 border-r-kuru sm:border-r-0 bg-back sm:bg-kuru text-xs shadow-sm shadow-shadow">
            くるひと
          </li>
        </ul>
      </nav>
      <LastUpdatedText className="px-4 my-3 sm:my-4 text-center text-xs text-sub" date={lastRunnedGetFollowers} />
      <section className={classNames(styles.listWrapper, 'mt-8 sm:mt-12')}>
        {items.map((item) => {
          const date = item.data.durationEnd.toDate();
          const dateText = date.toLocaleDateString(undefined, dateOptions);
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
              <div className={styles.userSection} data-type={item.data.type}>
                <UserCard {...item.data} />
              </div>
            </React.Fragment>
          );
        })}
      </section>
    </div>
  );
};

/**
 * メインエリア
 */
const Home: React.FC<Pick<MyPageProps, 'items' | 'lastRunnedGetFollowers'>> = ({ items, lastRunnedGetFollowers }) => {
  if (items.length > 0) {
    return <ListView items={items} lastRunnedGetFollowers={lastRunnedGetFollowers} />;
  }

  // lastRunnedGetFollowers が 0 の場合、watches 取得処理が1回も完了していない
  if (lastRunnedGetFollowers.getTime() === 0) {
    return <NoItemView />;
  }

  return <NoViewItemView lastRunnedGetFollowers={lastRunnedGetFollowers} />;
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
  currentAccount,
  multiAccounts,
  getNextRecords,
  onChangeCurrentUid,
}) => {
  const [paging, setPaging] = useState<number>(1);

  useEffect(() => {
    if (isLoading || isNextLoading) {
      return;
    }

    logEvent(analytics, 'element_show', {
      event_category: 'has_next',
      event_label: hasNext ? `has_next_p-${paging}` : `has_not_next_p-${paging}`,
      value: 100,
    });
  }, [isLoading, isNextLoading, hasNext, paging]);

  const getNext = () => {
    getNextRecords();
    logEvent(analytics, 'button_click', {
      event_category: 'click_next',
      event_label: `click_next_p-${paging}`,
      value: 100,
    });
    setPaging(paging + 1);
  };

  const superReload = () => {
    window.location.replace(window.location.href);
  };

  return (
    <div className={styles.wrapper}>
      {currentAccount && (
        <AccountSelector
          className="sticky top-0 z-30 h-12 sm:h-16 py-2 sm:py-3"
          currentAccount={currentAccount}
          multiAccounts={multiAccounts}
          onChange={onChangeCurrentUid}
        />
      )}
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
      <BottomNav active="my" />
    </div>
  );
};
