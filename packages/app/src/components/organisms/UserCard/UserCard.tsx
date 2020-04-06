/** @jsx jsx */
import { jsx } from '@emotion/core';
import { RecordData } from '@yukukuru/types';
import React from 'react';
import { ProfileImage } from '../../atoms/ProfileImage';
import {
  WrapperStyle,
  IconWrapperStyle,
  NameStyle,
  ScreenNameStyle,
  NotFoundedTextStyle,
  DurationTextStyle,
  NoDetailWrapperStyle,
} from './styled';

const convertDateText = (date: firebase.firestore.Timestamp) => {
  const d = date.toDate();
  const h = d.getHours();
  const m = `0${d.getMinutes()}`.slice(-2);
  return `${h}:${m}`;
};

export type UserCardProps = RecordData;

export const UserCard: React.FC<UserCardProps> = ({ user, type, durationStart, durationEnd }) => {
  const hasDetail = user.displayName && user.screenName && user.photoUrl;
  const duration = `${convertDateText(durationStart)} から ${convertDateText(durationEnd)} までの間`;

  return hasDetail ? (
    <a
      css={WrapperStyle}
      data-type={type}
      href={`https://twitter.com/${user.screenName}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div css={IconWrapperStyle}>
        <ProfileImage src={user.photoUrl} alt={user.displayName} />
      </div>
      <p css={NameStyle}>{user.displayName}</p>
      <p css={ScreenNameStyle}>@{user.screenName}</p>
      {user.maybeDeletedOrSuspended && <p css={NotFoundedTextStyle}>アカウントが削除、凍結された可能性があります</p>}
      <p css={DurationTextStyle}>{duration}</p>
    </a>
  ) : (
    <div css={NoDetailWrapperStyle} data-type={type}>
      <p className="head">情報の取得ができないユーザー</p>
      <p className="text">アカウントが削除、凍結された可能性があります</p>
      <p className="duration">{duration}</p>
    </div>
  );
};
