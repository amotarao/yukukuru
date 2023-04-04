import { UserData, Record, RecordV2 } from '@yukukuru/types';
import classNames from 'classnames';
import { logEvent } from 'firebase/analytics';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { useState, useEffect, Fragment } from 'react';
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
  records: (QueryDocumentSnapshot<Record | RecordV2> | { text: string })[];
  hasNext: boolean;
  hasToken: boolean;
  lastRun: Date | null;
  currentAccount: { id: string; twitter: UserData['twitter'] } | null;
  multiAccounts: { id: string; twitter: UserData['twitter'] }[];
  getNextRecords: ReturnType<typeof useRecords>[1]['getNextRecords'];
  onChangeCurrentUid: (uid: string) => void;
};

/**
 * 登録したてでデータ取得が1回も行われていないことを表示するコンポーネント
 */
const JustRegisteredView: React.FC = () => {
  return (
    <div>
      <p className="my-3 px-4 text-center text-xs text-sub sm:my-4">最初のデータ取得までしばらくお待ちください。</p>
    </div>
  );
};

/**
 * 取得はできているが、表示するデータがないことを表示するコンポーネント
 */
const NoListView: React.FC<Pick<MyPageProps, 'lastRun'>> = ({ lastRun }) => {
  return (
    <div>
      <p className="my-3 px-4 text-center text-xs text-sub sm:my-4">
        データの取得は完了していますが、今のところフォロワーの増減がありません。
      </p>
      {lastRun && <LastUpdatedText className="my-3 px-4 text-center text-xs text-sub sm:my-4" date={lastRun} />}
    </div>
  );
};

/**
 * リストコンポーネント
 */
const ListView: React.FC<Pick<MyPageProps, 'records' | 'lastRun'>> = ({ records, lastRun }) => {
  let currentDate = '';
  let currentTime = '';

  return (
    <div className="pb-10 sm:pb-20">
      <nav className="pointer-events-none sticky top-0 z-10 -mt-12 flex w-full px-6 py-3 sm:-mt-16 sm:py-5">
        <ul className="flex w-full justify-between sm:justify-around">
          <li className="relative inline-block rounded-full bg-back px-3 py-1 text-xs shadow-sm shadow-shadow before:absolute before:-left-1 before:top-1/2 before:h-2 before:w-2 before:-translate-y-1/2 before:rounded-full before:bg-yuku before:content-[''] sm:mr-8 sm:bg-yuku sm:before:content-none">
            ゆくひと
          </li>
          <li className="relative inline-block rounded-full bg-back px-3 py-1 text-xs shadow-sm shadow-shadow before:absolute before:-right-1 before:top-1/2 before:h-2 before:w-2 before:-translate-y-1/2 before:rounded-full before:bg-kuru before:content-[''] sm:ml-8 sm:bg-kuru sm:before:content-none">
            くるひと
          </li>
        </ul>
      </nav>
      {lastRun && <LastUpdatedText className="my-3 px-4 text-center text-xs text-sub sm:my-4" date={lastRun} />}
      <section className={classNames(styles.listWrapper, 'mt-8 sm:mt-12 sm:pb-12')}>
        {records.map((record, i) => {
          if ('text' in record) {
            return (
              <p
                key={`text-${i}`}
                className="mx-auto mt-8 mb-2 w-fit rounded-full bg-back px-4 py-1 text-center text-xs tracking-wider text-sub sm:mb-0 sm:mt-16"
              >
                {record.text}
              </p>
            );
          }

          const data = record.data();
          const date = dayjs('date' in data ? data.date.toDate() : data.durationEnd.toDate());
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
            <Fragment key={record.id}>
              {isShownDate && (
                <h2
                  className={classNames(
                    'mx-auto mt-16 mb-4 w-fit rounded-full bg-primary px-4 py-1 text-center text-xs tracking-widest text-back first:mt-0 sm:mt-20 sm:-mb-8 sm:first:mt-0',
                    styles.recordHead
                  )}
                >
                  {dateText}
                </h2>
              )}
              {isShownTime && (
                <p className="mx-auto mt-8 mb-2 w-fit rounded-full bg-back px-4 py-1 text-center text-xs tracking-wider text-sub sm:mb-0 sm:mt-16">
                  {timeText}
                </p>
              )}
              <div className={classNames('mb-4 px-6 sm:px-4', styles.userSection)} data-type={data.type}>
                <UserCard
                  className={classNames(
                    'w-11/12 max-w-[400px] sm:w-[400px] sm:max-w-[calc(50%-40px)]',
                    data.type === 'yuku' ? 'self-start' : 'self-end'
                  )}
                  record={data}
                />
              </div>
            </Fragment>
          );
        })}
      </section>
    </div>
  );
};

/**
 * メインエリア
 */
const Home: React.FC<Pick<MyPageProps, 'records' | 'lastRun'>> = ({ records, lastRun }) => {
  if (records.length > 0) {
    return <ListView records={records} lastRun={lastRun} />;
  }

  // lastRun が 0 の場合、watches 取得処理が1回も完了していない
  if (lastRun === null || lastRun.getTime() === 0) {
    return <JustRegisteredView />;
  }

  return <NoListView lastRun={lastRun} />;
};

/**
 * マイページ全体のコンポーネント
 */
export const MyPage: React.FC<MyPageProps> = ({
  isLoading,
  isNextLoading,
  records,
  hasNext,
  hasToken,
  lastRun,
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
            <Home records={records} lastRun={lastRun} />
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
