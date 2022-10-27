import { RecordData, RecordUserData } from '@yukukuru/types';
import classNames from 'classnames';
import { TwitterUserIcon } from '../../atoms/TwitterUserIcon';

export type CardProps = {
  className?: string;
  displayName?: string;
  screenName?: string;
  iconSrc?: string;
  href?: string;
  type: 'yuku' | 'kuru';
  maybeDeletedOrSuspended?: boolean;
};

const Card: React.FC<CardProps> = ({
  className,
  displayName,
  screenName,
  iconSrc,
  href,
  type,
  maybeDeletedOrSuspended = false,
}) => {
  const Tag: keyof HTMLElementTagNameMap = href ? 'a' : 'div';

  return (
    <Tag
      className={classNames(
        'relative grid grid-cols-[40px_1fr] gap-x-3 rounded-full bg-back p-3 text-inherit no-underline shadow shadow-shadow transition-shadow duration-200 before:absolute before:top-1/2 before:h-3 before:w-3 before:-translate-y-1/2 before:rounded-full before:content-[""] hover:shadow-md hover:shadow-shadow sm:grid-cols-[48px_1fr] sm:p-3 sm:before:content-none',
        type === 'yuku' ? 'before:-left-1.5 before:bg-yuku' : 'before:-right-1.5 before:bg-kuru',
        className
      )}
      data-type={type}
      href={href}
      target={href && '_blank'}
      rel={href && 'noopener noreferrer'}
    >
      <div className="flex items-center">
        <div className="row-span-full h-10 w-10 overflow-hidden rounded-full sm:h-12 sm:w-12">
          <TwitterUserIcon className="h-full w-full" src={iconSrc} alt="" width="48" height="48" />
        </div>
      </div>
      <div className="flex flex-col justify-center gap-1">
        {displayName && (
          <p className="col-start-2 overflow-hidden text-sm leading-normal line-clamp-1">{displayName}</p>
        )}
        <div className="flex gap-2">
          {screenName && <p className="col-start-2 text-xs font-bold leading-tight">{screenName}</p>}
          {maybeDeletedOrSuspended && <p className="col-start-2 text-xs">⚠️削除/凍結</p>}
        </div>
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
      maybeDeletedOrSuspended={user.maybeDeletedOrSuspended}
    />
  ) : (
    <Card className={className} displayName={'情報の取得ができないユーザー'} type={type} maybeDeletedOrSuspended />
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
