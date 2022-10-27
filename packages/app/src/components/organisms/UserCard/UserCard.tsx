import { RecordData, RecordUserData } from '@yukukuru/types';
import classNames from 'classnames';
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
};

const Card: React.FC<CardProps> = ({ className, displayName, screenName, iconSrc, href, type, notice }) => {
  const Tag: keyof HTMLElementTagNameMap = href ? 'a' : 'div';

  return (
    <Tag
      className={classNames(
        'mx-4 mb-4 grid w-4/5 grid-cols-[40px_1fr] gap-x-3 rounded bg-back p-3 text-inherit no-underline sm:m-4 sm:grid-cols-[48px_1fr] sm:rounded-lg sm:p-4',
        type === 'yuku' ? 'border-l-4 border-l-yuku sm:border-l-0' : 'border-r-4 border-r-kuru sm:border-r-0',
        styles.wrapper,
        className
      )}
      data-type={type}
      href={href}
      target={href && '_blank'}
      rel={href && 'noopener noreferrer'}
    >
      <div className="row-span-full h-10 w-10 overflow-hidden rounded-full sm:h-12 sm:w-12">
        <TwitterUserIcon className="h-full w-full" src={iconSrc} alt={displayName} width="48" height="48" />
      </div>
      <div>
        {displayName && <p className="col-start-2 text-sm leading-normal line-clamp-3">{displayName}</p>}
        {screenName && <p className="col-start-2 mt-1 text-xs font-bold leading-tight">{screenName}</p>}
        {notice && <p className="col-start-2 mt-2 text-xs">{notice}</p>}
      </div>
    </Tag>
  );
};

export type UserCardProps = {
  className?: string;
  user: RecordUserData;
  type: RecordData['type'];
};

export const UserCard: React.FC<UserCardProps> = ({ className, user, type }) => {
  const hasDetail = 'displayName' in user && 'screenName' in user && 'photoUrl' in user;

  return hasDetail ? (
    <Card
      className={className}
      displayName={user.displayName}
      screenName={`@${user.screenName}`}
      iconSrc={user.photoUrl}
      href={`https://twitter.com/${user.screenName}`}
      type={type}
      notice={user.maybeDeletedOrSuspended ? '⚠️ 削除または凍結の可能性有り' : undefined}
    />
  ) : (
    <Card
      className={className}
      displayName={'情報の取得ができないユーザー'}
      type={type}
      notice={'⚠️ 削除または凍結の可能性有り'}
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
};

export const DummyUserCard: React.FC<DummyUserCardProps> = ({ className, user, type }) => {
  return (
    <Card
      className={className}
      displayName={user.displayName}
      screenName={`@${user.screenName}`}
      iconSrc={user.photoUrl}
      type={type}
    />
  );
};
