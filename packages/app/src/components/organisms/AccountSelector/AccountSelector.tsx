import { UserTwitter } from '@yukukuru/types';
import classNames from 'classnames';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useSubscription } from '../../../hooks/useSubscription';
import { pagesPath } from '../../../lib/$path';
import { TwitterUserIcon } from '../../atoms/TwitterUserIcon';
import { Icon } from '../../shared/Icon';

export type AccountSelectorProps = {
  className?: string;
  inactive?: boolean;
  currentAccount: { id: string; twitter: UserTwitter } | null;
  multiAccounts: { id: string; twitter: UserTwitter }[];
  onChange?: (uid: string) => void;
};

export const AccountSelector: React.FC<AccountSelectorProps> = ({
  className,
  inactive = false,
  currentAccount,
  multiAccounts,
  onChange = () => null,
}) => {
  const { isSupporter } = useSubscription();
  const [isShownModal, setIsShownModal] = useState(false);
  const switchRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isShownModal) {
      modalRef.current?.focus();
    }
  }, [isShownModal]);

  return (
    <div className={className}>
      <button
        ref={switchRef}
        className={classNames(
          'max-w-36 sm:max-w-48 mx-auto flex items-center rounded-full bg-back p-1 shadow-sm shadow-shadow',
          inactive && 'cursor-default'
        )}
        onClick={() => {
          !inactive && setIsShownModal(!isShownModal);
        }}
      >
        <TwitterUserIcon
          className="mr-2 h-6 w-6 rounded-full sm:h-8 sm:w-8"
          src={currentAccount?.twitter.photoUrl ?? ''}
        />
        <span className="mr-2 flex-1 text-center text-xs line-clamp-1 sm:text-sm">
          @{currentAccount?.twitter.screenName ?? ''}
        </span>
        {!inactive && <Icon className="text-base" type="arrow_down" />}
      </button>
      {isShownModal && (
        <div className="absolute flex w-full justify-center p-4">
          <div
            ref={modalRef}
            className="max-h-64 w-10/12 overflow-y-auto rounded-lg bg-back shadow shadow-shadow sm:w-80"
            tabIndex={0}
            onBlur={(e) => {
              if (e.relatedTarget === switchRef.current) {
                return;
              }
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                setIsShownModal(false);
              }
            }}
          >
            {multiAccounts.map((account) => {
              return (
                <button
                  key={account.id}
                  className="mx-auto flex w-full items-center border-b border-b-shadow p-4 py-2 text-left last:border-b-0"
                  onClick={() => {
                    onChange(account.id);
                    setIsShownModal(false);
                  }}
                >
                  <TwitterUserIcon className="mr-2 h-8 w-8 rounded-full" src={account.twitter.photoUrl} />
                  <span className="flex-1 text-xs line-clamp-1 sm:text-sm">@{account.twitter.screenName}</span>
                  {account.id === currentAccount?.id && (
                    <Icon className="ml-2 text-base text-primary" type="check_circle" />
                  )}
                </button>
              );
            })}
            <Link
              className="mx-auto flex w-full items-center border-b border-b-shadow p-4 py-3 text-left text-sm text-primary last:border-b-0"
              href={pagesPath.supporter.$url()}
              onClick={() => {
                setIsShownModal(false);
              }}
            >
              {isSupporter ? 'アカウントを追加' : '月額99円で複数アカウント切り替え'}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
