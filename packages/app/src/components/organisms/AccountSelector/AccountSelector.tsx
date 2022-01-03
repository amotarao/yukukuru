import React from 'react';
import { TwitterUserIcon } from '../../atoms/TwitterUserIcon';

export type AccountSelectorProps = {
  className?: string;
  screenName?: string;
  imageSrc?: string;
};

export const AccountSelector: React.FC<AccountSelectorProps> = ({ className, screenName, imageSrc }) => {
  return (
    <div className={className}>
      <button className="flex items-center max-w-36 sm:max-w-48 mx-auto p-1 rounded-full bg-back shadow-sm shadow-shadow">
        <TwitterUserIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 rounded-full" src={imageSrc} />
        <span className="flex-1 mr-1 text-xs sm:text-sm text-center line-clamp-1">@{screenName}</span>
      </button>
    </div>
  );
};
