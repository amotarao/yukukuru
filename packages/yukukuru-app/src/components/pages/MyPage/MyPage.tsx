/** @jsx jsx */
import { jsx } from '@emotion/core';
import { RecordData } from '@yukukuru/types';
import React, { useState, useEffect } from 'react';
import { AuthStoreType } from '../../../store/auth';
import { RecordsStoreType } from '../../../store/database/records';
import { UserCard } from '../../organisms/UserCard';
import { BottomNav, NavType } from '../../organisms/BottomNav';
import { ErrorWrapper } from '../../organisms/ErrorWrapper';
import { NotificationList } from '../../organisms/NotificationList';
import { SettingMenu } from '../../organisms/SettingMenu';
import { style } from './style';
import { LoadingCircle } from '../../atoms/LoadingCircle';

export interface MyPageProps {
  isLoading: boolean;
  isNextLoading: boolean;
  items: RecordData[];
  hasItems: boolean;
  hasOnlyEmptyItems: boolean;
  hasNext: boolean;
  hasToken: boolean;
  getNextRecords: RecordsStoreType['getNextRecords'];
  signOut: AuthStoreType['signOut'];
}

/**
 * アイテムがないことを表示するコンポーネント
 */
const NoItem: React.FC = () => {
  return (
    <div>
      <p
        style={{
          fontSize: '0.8em',
          color: '#999',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          margin: '8px 16px',
        }}
      >
        <span style={{ whiteSpace: 'nowrap' }}>※ データ取得までに時間が掛かります。</span>
        <span style={{ whiteSpace: 'nowrap' }}>気長にお待ちください。</span>
      </p>
    </div>
  );
};

/**
 * 表示するデータがないことを表示するコンポーネント
 */
const NoViewItem: React.FC = () => {
  return (
    <div>
      <p
        style={{
          fontSize: '0.8em',
          color: '#999',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          margin: '8px 16px',
        }}
      >
        <span style={{ whiteSpace: 'nowrap' }}>データの取得は完了していますが、</span>
        <span style={{ whiteSpace: 'nowrap' }}>今のところフォロワーの増減がありません。</span>
      </p>
    </div>
  );
};

/**
 * メインエリア
 */
const Home: React.FC<Pick<MyPageProps, 'items' | 'hasItems' | 'hasOnlyEmptyItems'>> = ({
  items,
  hasItems,
  hasOnlyEmptyItems,
}) => {
  if (hasOnlyEmptyItems) {
    return <NoViewItem />;
  }
  if (!hasItems) {
    return <NoItem />;
  }

  let currentDate = '';

  return (
    <div css={style.homeArea}>
      <nav css={style.labelNav}>
        <ul>
          <li data-type="yuku">ゆくひと</li>
          <li data-type="kuru">くるひと</li>
        </ul>
      </nav>
      {items.map((item, itemIndex) => {
        const date = item.durationEnd.toDate();
        const dateText = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
        const showDate = currentDate !== dateText;
        currentDate = dateText;

        return (
          <React.Fragment key={itemIndex}>
            {showDate && <h2 css={style.recordHead}>{dateText}</h2>}
            <section css={style.userSection} data-type={item.type}>
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
  hasItems,
  hasOnlyEmptyItems,
  hasNext,
  hasToken,
  signOut,
  getNextRecords,
}) => {
  const [nav, setNav] = useState<NavType>('home');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    document.documentElement.style.overflow = nav !== 'home' ? 'hidden' : null;
  }, [nav]);

  return (
    <div css={style.wrapper}>
      {!isLoading && !hasToken && <ErrorWrapper text="ログアウトし、再度ログインしてください。" />}
      <main css={style.main}>
        {isLoading ? (
          <LoadingCircle />
        ) : (
          <>
            <Home items={items} hasItems={hasItems} hasOnlyEmptyItems={hasOnlyEmptyItems} />
            {!isLoading && isNextLoading && <LoadingCircle />}
            {!isLoading && hasNext && (
              <button css={style.getNextButton} disabled={isNextLoading} onClick={() => getNextRecords()}>
                続きを取得
              </button>
            )}
          </>
        )}
      </main>
      {nav === 'notification' && (
        <section css={style.section}>
          <NotificationList />
        </section>
      )}
      {nav === 'setting' && (
        <section css={style.section}>
          <SettingMenu />
        </section>
      )}
      <BottomNav active={nav} onChange={setNav} />
    </div>
  );
};
