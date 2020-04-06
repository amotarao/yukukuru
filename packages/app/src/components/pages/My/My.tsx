/** @jsx jsx */
import { jsx } from '@emotion/core';
import { RecordData } from '@yukukuru/types';
import React from 'react';
import MediaQuery from 'react-responsive';
import { TweetButton } from '../../organisms/TweetButton';
import { ThemeSwitchButtonContainer } from '../../organisms/ThemeSwitchButton';
import { UserCard } from '../../organisms/UserCard';
import {
  WrapperStyle,
  HeaderStyle,
  SignOutButtonStyle,
  MainAreaStyle,
  LabelNavStyle,
  RecordHeadStyle,
  UserSectionStyle,
  ErrorWrapperStyle,
  GetNextButtonStyle,
} from './styled';

export interface MyProps {
  isLoading: boolean;
  isNextLoading: boolean;
  items: RecordData[];
  hasItems: boolean;
  hasOnlyEmptyItems: boolean;
  hasNext: boolean;
  hasToken: boolean;
  getNextRecords: () => void;
  signOut: () => Promise<void>;
}

/**
 * エラー表示をするコンポーネント
 */
const Error: React.FC<Pick<MyProps, 'hasToken'>> = ({ hasToken }) => {
  if (!hasToken) {
    return (
      <div css={ErrorWrapperStyle}>
        <span style={{ whiteSpace: 'nowrap' }}>ログアウトし、再度ログインしてください。</span>
      </div>
    );
  }
  return null;
};

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
const Main: React.FC<Pick<MyProps, 'items' | 'hasItems' | 'hasOnlyEmptyItems'>> = ({
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
    <main css={MainAreaStyle}>
      <nav css={LabelNavStyle}>
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
            {showDate && <h2 css={RecordHeadStyle}>{dateText}</h2>}
            <section css={UserSectionStyle} data-type={item.type}>
              <UserCard {...item} />
            </section>
          </React.Fragment>
        );
      })}
    </main>
  );
};

/**
 * マイページ全体のコンポーネント
 */
export const My: React.FC<MyProps> = ({
  isLoading,
  isNextLoading,
  items,
  hasItems,
  hasOnlyEmptyItems,
  hasNext,
  hasToken,
  signOut,
  getNextRecords,
}) => (
  <div css={WrapperStyle}>
    {!isLoading && <Error hasToken={hasToken} />}
    <header css={HeaderStyle}>
      <TweetButton size="large" />
      <ThemeSwitchButtonContainer>
        <MediaQuery minWidth={375}>{(matches: boolean) => (matches ? 'テーマを変更' : 'テーマ')}</MediaQuery>
      </ThemeSwitchButtonContainer>
      <button css={SignOutButtonStyle} onClick={signOut}>
        ログアウト
      </button>
    </header>
    {isLoading ? (
      <p style={{ margin: 16 }}>読み込み中</p>
    ) : (
      <Main items={items} hasItems={hasItems} hasOnlyEmptyItems={hasOnlyEmptyItems} />
    )}
    {!isLoading && isNextLoading && <p style={{ margin: 16 }}>読み込み中</p>}
    {!isLoading && hasNext && (
      <button css={GetNextButtonStyle} disabled={isNextLoading} onClick={() => getNextRecords()}>
        続きを取得
      </button>
    )}
  </div>
);
