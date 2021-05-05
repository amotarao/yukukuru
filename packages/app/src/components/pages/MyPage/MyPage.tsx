/** @jsxImportSource @emotion/react */
import { RecordData } from '@yukukuru/types';
import firebase from 'firebase/app';
import React, { useState, useEffect } from 'react';
import { useRecords } from '../../../hooks/records';
import * as gtag from '../../../libs/gtag';
import { firestore } from '../../../modules/firebase';
import { LoadingCircle } from '../../atoms/LoadingCircle';
import { BottomNav, NavType } from '../../organisms/BottomNav';
import { ErrorWrapper } from '../../organisms/ErrorWrapper';
import { NotificationList } from '../../organisms/NotificationList';
import { SettingMenu } from '../../organisms/SettingMenu';
import { UserCard } from '../../organisms/UserCard';
import { style } from './style';

export interface MyPageProps {
  isLoading: boolean;
  isNextLoading: boolean;
  items: RecordData[];
  hasOnlyEmptyItems: boolean;
  hasNext: boolean;
  hasToken: boolean;
  uid: string | null;
  getNextRecords: ReturnType<typeof useRecords>[1]['getNextRecords'];
  signOut: () => void | Promise<void>;
}

/**
 * アイテムがないことを表示するコンポーネント
 */
const NoItem: React.FC = () => {
  return (
    <div style={{ paddingTop: 32 }}>
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
        <span style={{ whiteSpace: 'nowrap' }}>データ取得までに時間が掛かります。</span>
        <span style={{ whiteSpace: 'nowrap' }}>気長にお待ちください。</span>
      </p>
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
        <span style={{ whiteSpace: 'nowrap' }}>現在、新規アカウント登録を停止しています。</span>
        <span style={{ whiteSpace: 'nowrap' }}>(2021.5.4)</span>
      </p>
    </div>
  );
};

/**
 * 表示するデータがないことを表示するコンポーネント
 */
const NoViewItem: React.FC = () => {
  return (
    <div style={{ paddingTop: 32 }}>
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
const Home: React.FC<Pick<MyPageProps, 'items' | 'hasOnlyEmptyItems'>> = ({ items, hasOnlyEmptyItems }) => {
  if (hasOnlyEmptyItems) {
    return <NoViewItem />;
  }
  if (items.length === 0) {
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
  hasOnlyEmptyItems,
  hasNext,
  hasToken,
  uid,
  getNextRecords,
  signOut,
}) => {
  const [nav, setNav] = useState<NavType>('home');
  const [paging, setPaging] = useState<number>(1);

  // lastViewing 送信
  useEffect(() => {
    if (!uid) {
      return;
    }
    const doc = firestore.collection('userStatuses').doc(uid);
    doc.set({ lastViewing: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
  }, [uid]);

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
    <div css={style.wrapper}>
      {!isLoading && !hasToken && (
        <ErrorWrapper onClick={superReload}>
          <p>ログアウトし、再度ログインしてください。</p>
          <p>解消しない場合はこちらをタップしてください。</p>
        </ErrorWrapper>
      )}
      <main css={style.main}>
        {isLoading ? (
          <LoadingCircle />
        ) : (
          <>
            <Home items={items} hasOnlyEmptyItems={hasOnlyEmptyItems} />
            {!isLoading && isNextLoading && <LoadingCircle />}
            {!isLoading && hasNext && (
              <button css={style.getNextButton} disabled={isNextLoading} onClick={getNext}>
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
          <SettingMenu signOut={signOut} />
        </section>
      )}
      <BottomNav active={nav} onChange={setNav} />
    </div>
  );
};
