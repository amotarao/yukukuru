import { FirestoreIdData, UserData, RecordData } from '@yukukuru/types';
import classNames from 'classnames';
import { logEvent } from 'firebase/analytics';
import React, { useState, useEffect } from 'react';
import { useRecords } from '../../../hooks/records';
import { useAnalytics } from '../../../modules/analytics';
import { dayjs } from '../../../modules/dayjs';
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
      <p className="my-3 px-4 text-center text-xs text-sub sm:my-4">最初のデータ取得までしばらくお待ちください。</p>
      <p className="my-3 px-4 text-center text-xs text-sub sm:my-4">
        現在、フォロワー数1万人以上のアカウントの新規登録を停止しています。(
        {dayjs('2021-05-08').format('L')})
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
      <p className="my-3 px-4 text-center text-xs text-sub sm:my-4">
        データの取得は完了していますが、今のところフォロワーの増減がありません。
      </p>
      <LastUpdatedText className="my-3 px-4 text-center text-xs text-sub sm:my-4" date={lastRunnedGetFollowers} />
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
  let currentTime = '';

  return (
    <div className="pb-10 sm:pb-20">
      <nav className="pointer-events-none sticky top-0 z-10 -mt-12 flex w-full px-4 py-3 sm:-mt-16 sm:py-5">
        <ul className="flex w-full justify-between sm:justify-around">
          <li className="inline-block rounded border-l-4 border-l-yuku bg-back px-3 py-1 text-xs shadow-sm shadow-shadow sm:mr-8 sm:rounded-full sm:border-l-0 sm:bg-yuku">
            ゆくひと
          </li>
          <li className="inline-block rounded border-r-4 border-r-kuru bg-back px-3 py-1 text-xs shadow-sm shadow-shadow sm:ml-8 sm:rounded-full sm:border-r-0 sm:bg-kuru">
            くるひと
          </li>
        </ul>
      </nav>
      <LastUpdatedText className="my-3 px-4 text-center text-xs text-sub sm:my-4" date={lastRunnedGetFollowers} />
      <section className={classNames(styles.listWrapper, 'mt-8 sm:mt-12')}>
        {items.map((item) => {
          const date = dayjs(item.data.durationEnd.toDate());
          const dateText = date.format('L');
          const isShownDate = currentDate !== dateText;
          currentDate = dateText;

          if (isShownDate) {
            currentTime = '';
          }

          const timeText = date.format('LT');
          const isShownTime = currentTime !== timeText;
          currentTime = timeText;

          return (
            <React.Fragment key={item.id}>
              {isShownDate && (
                <h2
                  className={classNames(
                    'mx-auto my-2 mb-4 w-fit rounded-full bg-primary px-4 py-1 text-center text-xs tracking-widest text-back sm:my-2',
                    styles.recordHead
                  )}
                >
                  {dateText}
                </h2>
              )}
              {isShownTime && (
                <p className="my-4 mx-auto w-fit rounded-full bg-white px-4 py-1 text-center text-xs text-sub sm:-mb-2 sm:mt-8">
                  {timeText}
                </p>
              )}
              <div className={styles.userSection} data-type={item.data.type}>
                <UserCard className={item.data.type === 'yuku' ? 'self-start' : 'self-end'} {...item.data} />
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
  const analytics = useAnalytics();

  useEffect(() => {
    if (isLoading || isNextLoading) {
      return;
    }

    analytics &&
      logEvent(analytics, 'element_show', {
        event_category: 'has_next',
        event_label: hasNext ? `has_next_p-${paging}` : `has_not_next_p-${paging}`,
        value: 100,
      });
  }, [analytics, isLoading, isNextLoading, hasNext, paging]);

  const getNext = () => {
    getNextRecords();
    analytics &&
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
          className="sticky top-0 z-30 h-12 py-2 sm:h-16 sm:py-3"
          active={multiAccounts.length > 1}
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
