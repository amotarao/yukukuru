/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { RecordItemUserInterface } from '../../../stores/database/records';
import { WrapperStyle, IconWrapperStyle, NameStyle, ScreenNameStyle, NotFoundedTextStyle, NoDetailWrapperStyle } from './styled';

export interface UserCardProps {
  item: RecordItemUserInterface;
}

export const UserCard: React.FC<UserCardProps> = ({ item: { name, screenName, photoUrl, notFounded = false } }) => {
  const hasDetail = name && screenName && photoUrl;

  return hasDetail ? (
    <a css={WrapperStyle} href={`https://twitter.com/${screenName}`} target="_blank" rel="noopener noreferrer">
      <div css={IconWrapperStyle}>
        <img src={photoUrl} alt={name} />
      </div>
      <p css={NameStyle}>{name}</p>
      <p css={ScreenNameStyle}>@{screenName}</p>
      {notFounded && <p css={NotFoundedTextStyle}>アカウントが削除、凍結された可能性があります</p>}
    </a>
  ) : (
    <div css={NoDetailWrapperStyle}>
      <p className="head">情報の取得ができないユーザー</p>
      <p className="text">アカウントが削除、凍結された可能性があります</p>
    </div>
  );
};
