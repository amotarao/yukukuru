/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { RecordItemUserInterface } from '../../../stores/database/records';
import { WrapperStyle, IconWrapperStyle, NameStyle, ScreenNameStyle, NoDetailWrapperStyle } from './styled';

export interface UserCardProps {
  item: RecordItemUserInterface;
}

export const UserCard: React.FC<UserCardProps> = ({ item: { name, screenName, photoUrl } }) => {
  const hasDetail = name && screenName && photoUrl;

  return hasDetail ? (
    <a css={WrapperStyle} href={`https://twitter.com/${screenName}`} target="_blank" rel="noopener noreferrer">
      <div css={IconWrapperStyle}>
        <img src={photoUrl} alt={name} />
      </div>
      <p css={NameStyle}>{name}</p>
      <p css={ScreenNameStyle}>@{screenName}</p>
    </a>
  ) : (
    <div css={NoDetailWrapperStyle}>
      <p className="head">情報が取得できないユーザー</p>
      <p className="text">ユーザーが削除された可能性があります</p>
    </div>
  );
};
