'use client';

import { Record, RecordV2, UserTwitter } from '@yukukuru/types';
import classNames from 'classnames';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { LastUpdatedText } from '../../components/atoms/LastUpdatedText';
import { LoadingCircle } from '../../components/atoms/LoadingCircle';
import { AccountSelector } from '../../components/organisms/AccountSelector';
import { UserCard } from '../../components/organisms/UserCard';
import { useMultiAccounts } from '../../hooks/useMultiAccounts';
import { useRecords } from '../../hooks/useRecords';
import { useToken } from '../../hooks/useToken';
import { useAuth } from '../../lib/auth/hooks';
import { dayjs } from '../../lib/dayjs';
import { setLastViewing } from '../../lib/firestore/userStatuses';
import styles from './MyPage.module.scss';

export type MyPageProps = {
  isLoading: boolean;
  isNextLoading: boolean;
  records: (QueryDocumentSnapshot<Record | RecordV2> | { text: string })[];
  hasNext: boolean;
  hasToken: boolean;
  lastRun: Date | null;
  currentAccount: { id: string; twitter: UserTwitter } | null;
  multiAccounts: { id: string; twitter: UserTwitter }[];
  getNextRecords: ReturnType<typeof useRecords>['getNextRecords'];
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
const ListView: React.FC<
  Pick<MyPageProps, 'records' | 'lastRun'> & {
    prefix?: React.ReactNode;
  }
> = ({ prefix, records, lastRun }) => {
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
      {prefix}
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
const Home: React.FC<Pick<MyPageProps, 'hasToken' | 'records' | 'lastRun'>> = ({ hasToken, records, lastRun }) => {
  const { signIn } = useAuth();

  const error = useMemo(() => {
    if (hasToken) {
      return null;
    }

    return (
      <div className="mx-[1rem] mt-[1rem] mb-[1.5rem]">
        <button
          className="block w-full rounded border border-danger py-[0.5rem] px-[1rem] text-sm text-danger"
          onClick={() => {
            signIn();
          }}
        >
          Twitterの再連携が必要です。
          <br />
          <span className="underline">再ログイン</span>してください。
        </button>
      </div>
    );
  }, [hasToken, signIn]);

  if (records.length > 0) {
    return <ListView prefix={error} records={records} lastRun={lastRun} />;
  }

  // lastRun が 0 の場合、watches 取得処理が1回も完了していない
  if (lastRun === null || lastRun.getTime() === 0) {
    return (
      <>
        <JustRegisteredView />
        {error}
      </>
    );
  }

  return (
    <>
      <NoListView lastRun={lastRun} />
      {error}
    </>
  );
};

/**
 * マイページ全体のコンポーネント
 */
export const MyPage: React.FC = () => {
  const { isLoading: authIsLoading, uid: authUid } = useAuth();

  const [currentUid, setCurrentUid] = useState<string | null>(null);
  useEffect(() => {
    setCurrentUid(authUid);
  }, [authUid]);

  const { isFirstLoading, isFirstLoaded, isNextLoading, isLoadingLastRun, records, hasNext, lastRun, getNextRecords } =
    useRecords(currentUid);
  const { isLoading: tokenIsLoading, hasToken } = useToken(currentUid);
  const {
    isLoading: isLoadingMultiAccounts,
    accounts: multiAccounts,
    currentAccount,
  } = useMultiAccounts(authUid, currentUid);

  const recordsIsLoading = isFirstLoading || !isFirstLoaded;
  const isLoading = authIsLoading || recordsIsLoading || isLoadingLastRun || tokenIsLoading || isLoadingMultiAccounts;

  // lastViewing 送信
  useEffect(() => {
    if (!currentUid) {
      return;
    }
    setLastViewing(currentUid);
  }, [currentUid]);

  return (
    <div className={styles.wrapper}>
      {currentAccount && (
        <AccountSelector
          className="sticky top-0 z-30 h-12 py-2 sm:h-16 sm:py-3"
          currentAccount={currentAccount}
          multiAccounts={multiAccounts}
          onChange={(uid) => {
            setCurrentUid(uid);
          }}
        />
      )}
      <main className={styles.main}>
        {isLoading ? (
          <LoadingCircle />
        ) : (
          <>
            <Home hasToken={hasToken} records={records} lastRun={lastRun} />
            {!isLoading && isNextLoading && <LoadingCircle />}
            {!isLoading && hasNext && (
              <button
                className={styles.getNextButton}
                disabled={isNextLoading}
                onClick={() => {
                  getNextRecords();
                }}
              >
                続きを取得
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
};
