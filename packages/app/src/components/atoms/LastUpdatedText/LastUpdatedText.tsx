import dayjs from 'dayjs';
import React from 'react';

export type LastUpdatedTextProps = {
  className: string;
  date: Date;
};

/**
 * 最終取得日時
 */
export const LastUpdatedText: React.FC<LastUpdatedTextProps> = ({ className, date }) => {
  const now = dayjs();
  const diff = now.diff(date);

  let text = '';

  if (diff < 1000 * 60 * 60) {
    text = `${now.diff(date, 'm')}分前`;
  } else if (diff < 1000 * 60 * 60 * 24) {
    text = `${now.diff(date, 'h')}時間前`;
  } else {
    text = `${now.diff(date, 'd')}日前`;
  }

  return (
    <p className={className}>
      最終取得：
      <wbr />
      {text}
    </p>
  );
};
