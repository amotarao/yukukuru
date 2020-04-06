/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FirestoreDateLike, RecordData } from '@yukukuru/types';
import React from 'react';
import { ProfileImage } from '../../atoms/ProfileImage';
import * as style from './style';

const convertDateText = (date: FirestoreDateLike): string => {
  if (!(date instanceof Date || 'seconds' in date)) {
    return '';
  }

  const d = date instanceof Date ? date : date.toDate();
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
