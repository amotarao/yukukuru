import classNames from 'classnames';

export type SortButtonProps = {
  className?: string;
  direction?: 'asc' | 'desc';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export const SortButton: React.FC<SortButtonProps> = ({ className, direction = 'asc', onClick }) => {
  return (
    <button className={classNames('rounded bg-slate-200 px-1', className)} onClick={onClick}>
      {direction === 'asc' ? '▲' : '▼'}
    </button>
  );
};
