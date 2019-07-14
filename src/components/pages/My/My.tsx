/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { RecordInterface } from '../../../stores/database/records';
import { UserCard } from '../../organisms/UserCard';

export interface MyProps {
  className?: string;
  isLoading: boolean;
  items: RecordInterface[];
  signOut: () => Promise<void>;
}

export const My: React.FC<MyProps> = ({ className, isLoading, items, signOut }) => {
  return (
    <div className={className}>
      {isLoading && <p>読み込み中</p>}
      <button onClick={signOut}>ログアウト</button>
      {items.map(({ data: { durationStart, durationEnd, cameUsers, leftUsers } }, i) =>
        !cameUsers.length && !leftUsers.length ? null : (
          <section key={`item-${i}`} style={{ marginBottom: 40 }}>
            <h2>
              {durationStart.toDate().toLocaleString()} 〜 {durationEnd.toDate().toLocaleString()}
            </h2>
            <h3>きたひと</h3>
            {cameUsers.length ? (
              <ul>
                {cameUsers.map((user, j) => (
                  <li key={`item-${i}-cameuser-${j}`}>
                    <UserCard item={user} />
                  </li>
                ))}
              </ul>
            ) : (
              <p>なし</p>
            )}
            <h3>きえたひと</h3>
            <ul>
              {leftUsers.length ? (
                <ul>
                  {leftUsers.map((user, j) => (
                    <li key={`item-${i}-leftuser-${j}`}>
                      <UserCard item={user} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p>なし</p>
              )}
            </ul>
          </section>
        )
      ) || <p>記録なし</p>}
    </div>
  );
};
