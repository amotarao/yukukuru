import classNames from 'classnames';
import styles from './UserCardWrapper.module.scss';

export type UserCardWrapperProps = {
  className?: string;
  children?: React.ReactNode;
  type: 'yuku' | 'kuru';
};

export const UserCardWrapper: React.FC<UserCardWrapperProps> = ({ className, children, type }) => {
  return (
    <div className={classNames('px-6 sm:px-4', styles.wrapper, className)} data-type={type}>
      {children}
    </div>
  );
};
