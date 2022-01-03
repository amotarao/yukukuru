import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import React, { useEffect, useState, useRef } from 'react';
import { TwitterUserIcon } from '../../atoms/TwitterUserIcon';

export type AccountSelectorProps = {
  className?: string;
  screenName?: string;
  imageSrc?: string;
  change: (uid: string) => void;
};

export const AccountSelector: React.FC<AccountSelectorProps> = ({ className, screenName, imageSrc, change }) => {
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
        <TwitterUserIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 rounded-full" src={imageSrc} />
        <span className="flex-1 text-xs sm:text-sm text-center line-clamp-1">@{screenName}</span>
        <KeyboardArrowDownIcon className="text-base ml-2" />
      </button>
      {shown && (
        <div
          ref={modalRef}
          className="absolute flex justify-center w-full p-4"
          tabIndex={0}
          onBlur={(e) => {
            if (e.relatedTarget === switchRef.current) {
              return;
            }
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setShown(false);
            }
          }}
        >
          <div className="w-10/12 sm:w-80 rounded-lg bg-back shadow shadow-shadow">
            <button
              className="flex items-center w-full mx-auto p-4 py-2 border-b border-b-shadow last:border-b-0 text-left"
              onClick={() => {
                setShown(false);
              }}
            >
              <TwitterUserIcon className="w-8 h-8 mr-2 rounded-full" src={imageSrc} />
              <span className="flex-1 text-xs sm:text-sm line-clamp-1">@{screenName}</span>
              <CheckCircleIcon className="ml-2 text-base text-primary" />
            </button>
            <button
              className="flex items-center w-full mx-auto p-4 py-2 border-b border-b-shadow last:border-b-0 text-left"
              onClick={() => {
                setShown(false);
              }}
            >
              <TwitterUserIcon className="w-8 h-8 mr-2 rounded-full" src={imageSrc} />
              <span className="flex-1 text-xs sm:text-sm line-clamp-1">@{screenName}</span>
              <CheckCircleIcon className="ml-2 text-base text-primary" />
            </button>
            <button
              className="flex items-center w-full mx-auto p-4 py-2 border-b border-b-shadow last:border-b-0 text-left"
              onClick={() => {
                setShown(false);
              }}
            >
              <TwitterUserIcon className="w-8 h-8 mr-2 rounded-full" src={imageSrc} />
              <span className="flex-1 text-xs sm:text-sm line-clamp-1">@{screenName}</span>
              <CheckCircleIcon className="ml-2 text-base text-primary" />
            </button>
            <button
              className="flex items-center w-full mx-auto p-4 py-3 border-b border-b-shadow last:border-b-0 text-left text-sm text-primary"
              onClick={() => {
                setShown(false);
              }}
            >
              アカウントを追加
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
