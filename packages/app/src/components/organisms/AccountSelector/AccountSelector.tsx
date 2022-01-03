import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { UserData } from '@yukukuru/types';
import React, { useEffect, useState, useRef } from 'react';
import { TwitterUserIcon } from '../../atoms/TwitterUserIcon';

export type AccountSelectorProps = {
  className?: string;
  currentAccount: { id: string; twitter: UserData['twitter'] } | null;
  multiAccounts: { id: string; twitter: UserData['twitter'] }[];
  change: (uid: string) => void;
};

export const AccountSelector: React.FC<AccountSelectorProps> = ({
  className,
  currentAccount,
  multiAccounts,
  change,
}) => {
  const [shown, setShown] = useState(false);
  const switchRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shown) {
      modalRef.current?.focus();
    }
  }, [shown]);

  return (
    <div className={className}>
      <button
        ref={switchRef}
        className="flex items-center max-w-36 sm:max-w-48 mx-auto p-1 rounded-full bg-back shadow-sm shadow-shadow"
        onClick={() => {
          setShown(!shown);
        }}
      >
        <TwitterUserIcon
          className="w-6 sm:w-8 h-6 sm:h-8 mr-2 rounded-full"
          src={currentAccount?.twitter.photoUrl ?? ''}
        />
        <span className="flex-1 text-xs sm:text-sm text-center line-clamp-1">
          @{currentAccount?.twitter.screenName ?? ''}
        </span>
        <KeyboardArrowDownIcon className="text-base ml-2" />
      </button>
      {shown && (
        <div className="absolute flex justify-center w-full p-4">
          <div
            ref={modalRef}
            className="w-10/12 sm:w-80 max-h-64 overflow-y-auto rounded-lg bg-back shadow shadow-shadow"
            tabIndex={0}
            onBlur={(e) => {
              if (e.relatedTarget === switchRef.current) {
                return;
              }
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                setShown(false);
              }
            }}
          >
            {multiAccounts.map((account) => {
              return (
                <button
                  key={account.id}
                  className="flex items-center w-full mx-auto p-4 py-2 border-b border-b-shadow last:border-b-0 text-left"
                  onClick={() => {
                    change(account.id);
                    setShown(false);
                  }}
                >
                  <TwitterUserIcon className="w-8 h-8 mr-2 rounded-full" src={account.twitter.photoUrl} />
                  <span className="flex-1 text-xs sm:text-sm line-clamp-1">@{account.twitter.screenName}</span>
                  {account.id === currentAccount?.id && <CheckCircleIcon className="ml-2 text-base text-primary" />}
                </button>
              );
            })}
            {/* <button
              className="flex items-center w-full mx-auto p-4 py-3 border-b border-b-shadow last:border-b-0 text-left text-sm text-primary"
              onClick={() => {
                setShown(false);
              }}
            >
              アカウントを追加
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
};
