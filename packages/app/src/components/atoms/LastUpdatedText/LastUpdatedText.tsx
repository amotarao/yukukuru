import classNames from 'classnames';
import Link from 'next/link';
import { useMemo } from 'react';
import { useSubscription } from '../../../hooks/useSubscription';
import { dayjs } from '../../../modules/dayjs';

const ads = ['月額99円で、最短15分おきに更新', '月額99円で、複数アカウント切り替え'];

export type LastUpdatedTextProps = {
  className: string;
  date: Date;
};

/**
 * 最終取得日時
 */
export const LastUpdatedText: React.FC<LastUpdatedTextProps> = ({ className, date }) => {
  const { isLoading, isSupporter } = useSubscription();

  const text = useMemo(() => {
    const now = dayjs();
    const diff = now.diff(date);

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
      {isLoading || isSupporter === null ? null : !isSupporter ? (
        <p>
          <Link className="font-bold text-primary underline" href="/supporter">
            {ad}
          </Link>
        </p>
      ) : null}
    </div>
  );
};
