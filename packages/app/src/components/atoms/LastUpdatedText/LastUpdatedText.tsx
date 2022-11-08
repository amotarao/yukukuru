import classNames from 'classnames';
import Link from 'next/link';
import { useMemo } from 'react';
import { useSubscription } from '../../../hooks/useSubscription';
import { dayjs } from '../../../modules/dayjs';

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

  return (
    <div className={classNames('flex flex-col gap-2', className)}>
      <p>
        最終更新：
        <wbr />
        {text}
      </p>
      <p>
        {isLoading ? null : !isSupporter ? (
          <Link className="font-bold text-primary underline" href="/supporter">
            ゆくくるサポーターで更新頻度をアップ
          </Link>
        ) : null}
      </p>
    </div>
  );
};
