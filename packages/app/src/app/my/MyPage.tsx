'use client';

import { Record, RecordV2, UserTwitter } from '@yukukuru/types';
import classNames from 'classnames';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { UserCardWrapper } from '../../components/UserCardWrapper';
import { LoadingCircle } from '../../components/atoms/LoadingCircle';
import { UpdateStatus } from '../../components/atoms/UpdateStatus';
import { AccountSelector } from '../../components/organisms/AccountSelector';
import { UserCard } from '../../components/organisms/UserCard';
import { useMultiAccounts } from '../../hooks/useMultiAccounts';
import { useRecords } from '../../hooks/useRecords';
import { useToken } from '../../hooks/useToken';
import { useAuth } from '../../lib/auth/hooks';
import { dayjs } from '../../lib/dayjs';
import { setLastViewing } from '../../lib/firestore/userStatuses';

export type MyPageProps = {
  isLoading: boolean;
  isNextLoading: boolean;
  records: (QueryDocumentSnapshot<Record | RecordV2> | { text: string })[];
  hasNext: boolean;
  hasToken: boolean;
  lastUpdated: Date | null;
  nextUpdate: Date | null;
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
const NoListView: React.FC<{
  updateStatus?: React.ReactNode;
}> = ({ updateStatus }) => {
  return (
    <div>
      <p className="my-3 px-4 text-center text-xs text-sub sm:my-4">
        データの取得は完了していますが、今のところフォロワーの増減がありません。
      </p>
      <div className="my-3">{updateStatus}</div>
    </div>
  );
};

/**
 * リストコンポーネント
 */
const ListView: React.FC<
  Pick<MyPageProps, 'records'> & {
    error?: React.ReactNode;
    updateStatus?: React.ReactNode;
  }
> = ({ error, updateStatus, records }) => {
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
      {error}
      <div className="my-3">{updateStatus}</div>
      <section className="mt-8 sm:mt-12 sm:bg-[linear-gradient(to_bottom,_var(--back-2),_var(--back-2))] sm:bg-[length:2px_100%] sm:bg-center sm:bg-no-repeat sm:pb-12">
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
                <h2 className="mx-auto mt-16 mb-4 w-fit rounded-full bg-primary px-4 py-1 text-center text-xs tracking-widest text-back first:mt-0 sm:mt-20 sm:-mb-8 sm:first:mt-0">
                  {dateText}
                </h2>
              )}
              {isShownTime && (
                <p className="mx-auto mt-8 mb-2 w-fit rounded-full bg-back px-4 py-1 text-center text-xs tracking-wider text-sub sm:mb-0 sm:mt-16">
                  {timeText}
                </p>
              )}
              <UserCardWrapper className="mb-4 sm:mb-6" type={data.type}>
                <UserCard
                  className={classNames(
                    'w-11/12 max-w-[400px] sm:w-[400px] sm:max-w-[calc(50%-40px)]',
                    data.type === 'yuku' ? 'self-start' : 'self-end'
                  )}
                  record={data}
                />
              </UserCardWrapper>
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
const Home: React.FC<Pick<MyPageProps, 'hasToken' | 'records' | 'lastUpdated' | 'nextUpdate'>> = ({
  hasToken,
  records,
  lastUpdated,
  nextUpdate,
}) => {
  const { signIn } = useAuth();

  const error = useMemo(() => {
    if (hasToken) return null;

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

  const updateStatus = useMemo(() => {
    if (!lastUpdated) return null;

    return (
      <UpdateStatus
        className="px-4 text-center text-xs text-sub sm:my-4"
        lastUpdated={lastUpdated}
        nextUpdate={nextUpdate}
      />
    );
  }, [lastUpdated, nextUpdate]);

  if (records.length > 0) {
    return <ListView error={error} records={records} updateStatus={updateStatus} />;
  }

  // lastUpdated が 0 の場合、watches 取得処理が1回も完了していない
  if (lastUpdated === null || lastUpdated.getTime() === 0) {
    return (
      <>
        <JustRegisteredView />
        {error}
      </>
    );
  }

  return (
    <>
      <NoListView updateStatus={updateStatus} />
      {error}
    </>
  );
};

/**
 * マイページ全体のコンポーネント
 */
export const MyPage: React.FC = () => {
  const { uid: authUid } = useAuth();

  const [currentUid, setCurrentUid] = useState<string | null>(null);
  useEffect(() => {
    setCurrentUid(authUid);
  }, [authUid]);

  const {
    isFirstLoading,
    isFirstLoaded,
    isNextLoading,
    isLoadingUpdateStatus,
    records,
    hasNext,
    lastUpdated,
    nextUpdate,
    getNextRecords,
  } = useRecords(currentUid);
  const { isLoading: isLoadingToken, hasToken } = useToken(currentUid);
  const {
    isLoading: isLoadingMultiAccounts,
    accounts: multiAccounts,
    currentAccount,
  } = useMultiAccounts(authUid, currentUid);

  const isLoadingRecords = isFirstLoading || !isFirstLoaded;
  const isLoading = isLoadingRecords || isLoadingUpdateStatus || isLoadingToken || isLoadingMultiAccounts;

  // lastViewing 送信
  useEffect(() => {
    if (!currentUid) {
      return;
    }
    setLastViewing(currentUid);
  }, [currentUid]);

  return (
    <div className="px-[calc(50%-240px)] sm:px-[calc(50%-480px)]">
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
      <main className="pb-[calc(80px+var(--safe-bottom))]">
        {isLoading ? (
          <LoadingCircle />
        ) : (
          <>
            <Home hasToken={hasToken} records={records} lastUpdated={lastUpdated} nextUpdate={nextUpdate} />
            {!isLoading && isNextLoading && <LoadingCircle />}
            {!isLoading && hasNext && (
              <button
                className="mx-[16px] my-[40px] h-[48px] w-[calc(100%-32px)] cursor-pointer appearance-none rounded-[4px] border-0 bg-primary text-[1rem] text-back disabled:cursor-not-allowed disabled:opacity-70"
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
