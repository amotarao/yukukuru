/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Timestamp, RecordData, RecordUserData } from '@yukukuru/types';
import React from 'react';
import { ProfileImage } from '../../atoms/ProfileImage';
import * as style from './style';

const convertDateText = (date: Timestamp): string => {
  const d = date.toDate();
  const h = d.getHours();
  const m = `0${d.getMinutes()}`.slice(-2);
  return `${h}:${m}`;
};

export interface UserCardProps {
  user: RecordUserData;
  type: RecordData['type'];
  durationStart: RecordData['durationStart'];
  durationEnd: RecordData['durationEnd'];
}

export const UserCard: React.FC<UserCardProps> = ({ user, type, durationStart, durationEnd }) => {
  const hasDetail = 'displayName' in user && 'screenName' in user && 'photoUrl' in user;
  const duration = `${convertDateText(durationStart)} から ${convertDateText(durationEnd)} までの間`;

  return hasDetail ? (
    <a
      css={style.wrapper}
      data-type={type}
      href={`https://twitter.com/${user.screenName}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div css={style.iconWrapper}>
        <ProfileImage src={user.photoUrl} alt={user.displayName} />
      </div>
      <p css={style.name}>{user.displayName}</p>
      <p css={style.screenName}>@{user.screenName}</p>
      {user.maybeDeletedOrSuspended && <p css={style.notFoundedText}>アカウントが削除、凍結された可能性があります</p>}
      <p css={style.durationText}>{duration}</p>
    </a>
  ) : (
    <div css={style.noDetailWrapper} data-type={type}>
      <p className="head">情報の取得ができないユーザー</p>
      <p className="text">アカウントが削除、凍結された可能性があります</p>
      <p className="duration">{duration}</p>
    </div>
  );
};

export interface DummyUserCardProps {
  user: {
    screenName: string;
    displayName: string;
    photoUrl: string;
  };
  type: RecordData['type'];
  durationStart: string;
  durationEnd: string;
}

export const DummyUserCard: React.FC<DummyUserCardProps> = ({ user, type, durationStart, durationEnd }) => {
  const duration = `${durationStart} から ${durationEnd} までの間`;

  return (
    <div css={style.wrapper} data-type={type}>
      <div css={style.iconWrapper}>
        <ProfileImage src={user.photoUrl} alt={user.displayName} />
      </div>
      <p css={style.name}>{user.displayName}</p>
      <p css={style.screenName}>@{user.screenName}</p>
      <p css={style.durationText}>{duration}</p>
    </div>
  );
};
