import { UrlObject } from 'url';
import classNames from 'classnames';
import Link from 'next/link';
import { Icon } from './shared/Icon';

export type PageHeaderProps = {
  className?: string;
  children?: React.ReactNode;
  backTo?: UrlObject | string;
};

export const PageHeader: React.FC<PageHeaderProps> = ({ className, children, backTo }) => {
  return (
    <header className={classNames('grid h-12 grid-cols-[48px_1fr_48px] gap-4', className)}>
      {backTo && (
        <Link className="grid place-items-center" href={backTo}>
          <Icon className="h-8 w-8" type="arrow_back" aria-label="戻る" />
        </Link>
      )}
      <h1 className="col-start-2 self-center text-center">{children}</h1>
    </header>
  );
};
