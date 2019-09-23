/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { RecordViewUserInterface } from '../../../stores/database/records';
import { ProfileImage } from '../../atoms/ProfileImage';
import { WrapperStyle, IconWrapperStyle, NameStyle, ScreenNameStyle, NotFoundedTextStyle, DurationTextStyle, NoDetailWrapperStyle } from './styled';

const convertDateText = (date: firebase.firestore.Timestamp) => {
  const d = date.toDate();
  const h = d.getHours();
  const m = `0${d.getMinutes()}`.slice(-2);
  return `${h}:${m}`;
};

export interface UserCardProps extends RecordViewUserInterface {}

export const UserCard: React.FC<UserCardProps> = ({ data: { name, screenName, photoUrl, notFounded = false }, duration: { start, end } }) => {
  const hasDetail = name && screenName && photoUrl;
  const duration = `${convertDateText(start)} から ${convertDateText(end)} までの間`;

  return hasDetail ? (
    <a css={WrapperStyle} href={`https://twitter.com/${screenName}`} target="_blank" rel="noopener noreferrer">
      <div css={IconWrapperStyle}>
        <ProfileImage src={photoUrl} alt={name} />
      </div>
      <p css={NameStyle}>{name}</p>
      <p css={ScreenNameStyle}>@{screenName}</p>
      {notFounded && <p css={NotFoundedTextStyle}>アカウントが削除、凍結された可能性があります</p>}
      <p css={DurationTextStyle}>{duration}</p>
    </a>
  ) : (
    <div css={NoDetailWrapperStyle}>
      <p className="head">情報の取得ができないユーザー</p>
      <p className="text">アカウントが削除、凍結された可能性があります</p>
      <p className="duration">{duration}</p>
    </div>
  );
};
