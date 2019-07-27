/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { RecordViewInterface } from '../../../stores/database/records';
import { TweetButton } from '../../organisms/TweetButton';
import { UserCard } from '../../organisms/UserCard';
import {
  WrapperStyle,
  HeaderStyle,
  SignOutButtonStyle,
  RecordSectionStyle,
  RecordHeadStyle,
  CameSectionStyle,
  CameHeadStyle,
  LeftSectionStyle,
  LeftHeadStyle,
  EmptyTextStyle,
  ErrorWrapperStyle,
  GetNextButtonStyle,
} from './styled';

export interface MyProps {
  isLoading: boolean;
  isNextLoading: boolean;
  items: RecordViewInterface[];
  hasNext: boolean;
  hasToken: boolean;
  getNextRecords: () => void;
  signOut: () => Promise<void>;
}

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

const Inner: React.FC<Pick<MyProps, 'items'>> = ({ items }) => {
  const existsItems = items.length > 0;
  const filteredItems = items.filter(({ cameUsers, leftUsers }) => {
    return cameUsers.length > 0 || leftUsers.length > 0;
  });
  const existsFilteredItems = filteredItems.length > 0;

  if (!existsItems) {
    return (
      <div>
        <p style={{ fontSize: '0.8em', color: '#999', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', margin: '8px 16px' }}>
          <span style={{ whiteSpace: 'nowrap' }}>※ データ取得までに時間が掛かります。</span>
          <span style={{ whiteSpace: 'nowrap' }}>気長にお待ちください。</span>
        </p>
      </div>
    );
  }
  if (!existsFilteredItems) {
    return (
      <div>
        <p style={{ fontSize: '0.8em', color: '#999', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', margin: '8px 16px' }}>
          <span style={{ whiteSpace: 'nowrap' }}>データの取得は完了していますが、</span>
          <span style={{ whiteSpace: 'nowrap' }}>今のところフォロワーの増減がありません。</span>
        </p>
      </div>
    );
  }

  return (
    <React.Fragment>
      {items.map((item, i) => {
        const date = new Date(item.date * 24 * 60 * 60 * 1000);
        const dateText = `${date.getMonth() + 1}月${date.getDate()}日`;
        return (
          <section css={RecordSectionStyle} key={`item-${i}`}>
            <h2 css={RecordHeadStyle}>{dateText}の記録</h2>
            <section css={CameSectionStyle}>
              <h3 css={LeftHeadStyle}>ゆくひと ({item.leftUsers.filter((user) => user).length})</h3>
              {item.leftUsers.length ? (
                <ul style={{ listStyle: 'none', marginBottom: 64 }}>
                  {item.leftUsers.map((user, j) => (
                    <li key={`item-${i}-leftuser-${j}`}>
                      <UserCard {...user} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p css={EmptyTextStyle}>なし</p>
              )}
            </section>
            <section css={LeftSectionStyle}>
              <h3 css={CameHeadStyle}>くるひと ({item.cameUsers.filter((user) => user).length})</h3>
              {item.cameUsers.length ? (
                <ul style={{ listStyle: 'none', marginBottom: 64 }}>
                  {item.cameUsers.map((user, j) => (
                    <li key={`item-${i}-cameuser-${j}`}>
                      <UserCard {...user} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p css={EmptyTextStyle}>なし</p>
              )}
            </section>
          </section>
        );
      })}
    </React.Fragment>
  );
};

export const My: React.FC<MyProps> = ({ isLoading, isNextLoading, items, hasNext, hasToken, signOut, getNextRecords }) => (
  <div css={WrapperStyle}>
    {!isLoading && <Error hasToken={hasToken} />}
    <header css={HeaderStyle}>
      <TweetButton size="large" />
      <button css={SignOutButtonStyle} onClick={signOut}>
        ログアウト
      </button>
    </header>
    {isLoading ? <p style={{ margin: 16 }}>読み込み中</p> : <Inner items={items} />}
    {!isLoading && isNextLoading && <p style={{ margin: 16 }}>読み込み中</p>}
    {!isLoading && hasNext && (
      <button css={GetNextButtonStyle} disabled={isNextLoading} onClick={() => getNextRecords()}>
        続きを取得
      </button>
    )}
  </div>
);
