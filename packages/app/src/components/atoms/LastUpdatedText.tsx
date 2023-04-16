import classNames from 'classnames';
import Link from 'next/link';
import { useMemo } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { pagesPath } from '../../lib/$path';
import { dayjs } from '../../lib/dayjs';

const ads = ['月額99円で最短5分おきに更新', '月額99円で複数アカウント切り替え'];

export type LastUpdatedTextProps = {
  className: string;
  date: Date;
};

/**
 * 最終取得日時
 */
export const LastUpdatedText: React.FC<LastUpdatedTextProps> = ({ className, date }) => {
  const { isLoading, stripeRole } = useSubscription();

  const text = useMemo(() => {
    const now = dayjs();
    const diff = now.diff(date);

    if (diff < 1000 * 60) {
      return 'たった今';
    }
    if (diff < 1000 * 60 * 60) {
      return `${now.diff(date, 'm')}分前`;
    }
    if (diff < 1000 * 60 * 60 * 24) {
      return `${now.diff(date, 'h')}時間前`;
    }
    return `${now.diff(date, 'd')}日前`;
  }, [date]);

  const ad = useMemo(() => {
    const index = Math.floor(Math.random() * ads.length);
    return ads[index];
  }, []);

  return (
    <div className={classNames('flex flex-col gap-2', className)}>
      <p>
        最終更新：
        <wbr />
        {text}
      </p>
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
