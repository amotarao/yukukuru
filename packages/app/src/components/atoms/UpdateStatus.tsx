import classNames from 'classnames';
import Link from 'next/link';
import { useMemo } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { pagesPath } from '../../lib/$path';
import { dayjs } from '../../lib/dayjs';

const ads = ['月額99円で最短3分おきに更新', '月額99円で複数アカウント切り替え'];

const getLastUpdatedText = (lastUpdated: Date | null): string => {
  if (!lastUpdated) return '';

  const now = dayjs();
  const diffMinutes = now.diff(lastUpdated, 'minutes');

  if (diffMinutes < 1) {
    return 'たった今';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}分前`;
  }
  if (diffMinutes < 60 * 24) {
    return `${now.diff(lastUpdated, 'h')}時間前`;
  }
  return `${now.diff(lastUpdated, 'd')}日前`;
};

const getNextUpdateText = (nextUpdate: Date | null): string => {
  if (!nextUpdate) return '';

  const now = new Date();
  const base = dayjs(nextUpdate);
  const diffMinutes = base.diff(now, 'minutes');

  if (diffMinutes < 1) {
    return 'まもなく';
  }
  if (diffMinutes < 60) {
    return `${base.diff(now, 'm') + 1}分以内`;
  }
  if (diffMinutes < 60 * 24) {
    return `${base.diff(now, 'h') + 1}時間以内`;
  }
  if (diffMinutes < 60 * 24 * 5) {
    return `${base.diff(now, 'd') + 1}日以内`;
  }
  return '未定';
};

export type UpdateStatusProps = {
  className: string;
  lastUpdated: Date | null;
  nextUpdate: Date | null;
};

export const UpdateStatus: React.FC<UpdateStatusProps> = ({ className, lastUpdated, nextUpdate }) => {
  const { isLoading, stripeRole } = useSubscription();

  const ad = useMemo(() => ads[Math.floor(Math.random() * ads.length)], []);

  return (
    <div className={classNames('flex flex-col gap-2', className)}>
      <div className="flex justify-center gap-2">
        <p>最終更新: {getLastUpdatedText(lastUpdated)}</p>
        <span aria-hidden="true">/</span>
        <p>次回更新: {getNextUpdateText(nextUpdate)}</p>
      </div>
      {isLoading || stripeRole === 'supporter' ? null : (
        <p>
          <Link className="font-bold text-primary underline" href={pagesPath.my.supporter.$url()}>
            {ad}
          </Link>
        </p>
      )}
    </div>
  );
};
