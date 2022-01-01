import { Timestamp, RecordData, RecordUserData } from '@yukukuru/types';
import classNames from 'classnames';
import React from 'react';
import { TwitterUserIcon } from '../../atoms/TwitterUserIcon';
import styles from './styles.module.scss';

export type CardProps = {
  className?: string;
  displayName?: string;
  screenName?: string;
  iconSrc?: string;
  href?: string;
  type: 'yuku' | 'kuru';
  notice?: string;
  duration?: string;
};

const Card: React.FC<CardProps> = ({ className, displayName, screenName, iconSrc, href, type, notice, duration }) => {
  const Tag: keyof JSX.IntrinsicElements = href ? 'a' : 'div';

  return (
    <Tag
      className={classNames(
        'grid grid-cols-[48px_1fr] grid-rows-[repeat(4,auto)] gap-x-3 w-4/5 m-4 p-4 rounded-lg bg-back text-inherit no-underline',
        styles.wrapper,
        className
      )}
      data-type={type}
      href={href}
      target={href && '_blank'}
      rel={href && 'noopener noreferrer'}
    >
      <div className="row-span-full w-12 h-12 rounded-full float-left overflow-hidden">
        <TwitterUserIcon
          className="w-full h-full"
          src={iconSrc}
          alt={displayName}
          width="48"
          height="48"
          loading="lazy"
        />
      </div>
      {displayName && <p className="col-start-2 mb-1 leading-normal line-clamp-3">{displayName}</p>}
      {screenName && <p className="col-start-2 font-bold leading-tight text-xs">{screenName}</p>}
      {notice && <p className="col-start-2 mt-2 text-xs">{notice}</p>}
      {duration && <p className="col-start-2 mt-2 text-xs text-sub">{duration}</p>}
    </Tag>
  );
};

const convertDateText = (date: Timestamp): string => {
  const d = date.toDate();
  const h = d.getHours();
  const m = `0${d.getMinutes()}`.slice(-2);
  return `${h}:${m}`;
};

export type UserCardProps = {
  className?: string;
  user: RecordUserData;
  type: RecordData['type'];
  durationStart: RecordData['durationStart'];
  durationEnd: RecordData['durationEnd'];
};

export const UserCard: React.FC<UserCardProps> = ({ className, user, type, durationStart, durationEnd }) => {
  const hasDetail = 'displayName' in user && 'screenName' in user && 'photoUrl' in user;
  const duration = `${convertDateText(durationStart)} から ${convertDateText(durationEnd)} までの間`;

  return hasDetail ? (
    <Card
      className={className}
      displayName={user.displayName}
      screenName={`@${user.screenName}`}
      iconSrc={user.photoUrl}
      href={`https://twitter.com/${user.screenName}`}
      type={type}
      notice={user.maybeDeletedOrSuspended && '⚠️ 削除または凍結の可能性有り'}
      duration={duration}
    />
  ) : (
    <Card
      className={className}
      displayName={'情報の取得ができないユーザー'}
      type={type}
      notice={'⚠️ 削除または凍結の可能性有り'}
      duration={duration}
    />
  );
};

export type DummyUserCardProps = {
  className?: string;
  user: {
    screenName: string;
    displayName: string;
    photoUrl: string;
  };
  type: RecordData['type'];
  durationStart: string;
  durationEnd: string;
};

export const DummyUserCard: React.FC<DummyUserCardProps> = ({ className, user, type, durationStart, durationEnd }) => {
  const duration = `${durationStart} から ${durationEnd} までの間`;

  return (
    <Card
      className={className}
      displayName={user.displayName}
      screenName={`@${user.screenName}`}
      iconSrc={user.photoUrl}
      type={type}
      duration={duration}
    />
  );
};
