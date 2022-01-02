import classNames from 'classnames';

export type SortButtonProps = {
  className?: string;
  direction?: 'asc' | 'desc';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export const SortButton: React.FC<SortButtonProps> = ({ className, direction = 'asc', onClick }) => {
  return (
    <button className={classNames('px-1 bg-slate-200 rounded', className)} onClick={onClick}>
      {direction === 'asc' ? '▲' : '▼'}
    </button>
  );
};
