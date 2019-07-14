/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { RecordInterface } from '../../../stores/database/records';
import { UserCard } from '../../organisms/UserCard';
import { WrapperStyle, HeaderStyle, SignOutButtonStyle, RecordHeadStyle, DurationStyle, CameHeadStyle, LeftHeadStyle, EmptyTextStyle } from './styled';

export interface MyProps {
  isLoading: boolean;
  items: RecordInterface[];
  signOut: () => Promise<void>;
}

export const My: React.FC<MyProps> = ({ isLoading, items, signOut }) => {
  return (
    <div css={WrapperStyle}>
      <header css={HeaderStyle}>
        <button css={SignOutButtonStyle} onClick={signOut}>
          ログアウト
        </button>
      </header>
      {isLoading ? (
        <p>読み込み中</p>
      ) : items.length ? (
        items.map(({ data: { durationStart, durationEnd, cameUsers, leftUsers } }, i) =>
          !cameUsers.length && !leftUsers.length ? null : (
            <section key={`item-${i}`} style={{ marginBottom: 64 }}>
              <h2 css={RecordHeadStyle}>ある期間の記録</h2>
              <p css={DurationStyle}>
                {durationStart.toDate().toLocaleString()} 〜 {durationEnd.toDate().toLocaleString()}
              </p>
              <section>
                <h3 css={CameHeadStyle}>フォローされた ({cameUsers.length})</h3>
                {cameUsers.length ? (
                  <ul style={{ listStyle: 'none' }}>
                    {cameUsers.map((user, j) => (
                      <li key={`item-${i}-cameuser-${j}`}>
                        <UserCard item={user} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p css={EmptyTextStyle}>なし</p>
                )}
              </section>
              <section>
                <h3 css={LeftHeadStyle}>フォロー解除された ({leftUsers.length})</h3>
                <ul>
                  {leftUsers.length ? (
                    <ul style={{ listStyle: 'none' }}>
                      {leftUsers.map((user, j) => (
                        <li key={`item-${i}-leftuser-${j}`}>
                          <UserCard item={user} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p css={EmptyTextStyle}>なし</p>
                  )}
                </ul>
              </section>
            </section>
          )
        )
      ) : (
        <div>
          <p style={{ fontSize: '0.8em', color: '#999', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', margin: '8px 16px' }}>
            <span style={{ whiteSpace: 'nowrap' }}>※ データ取得までに時間が掛かります。</span>
            <span style={{ whiteSpace: 'nowrap' }}>気長にお待ちください。</span>
          </p>
          <p style={{ fontSize: '0.8em', color: '#999', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', margin: '8px 16px' }}>
            <span style={{ whiteSpace: 'nowrap' }}>※ フォロワーの増減が分かり次第、</span>
            <span style={{ whiteSpace: 'nowrap' }}>リストが表示されます</span>
          </p>
        </div>
      )}
    </div>
  );
};
