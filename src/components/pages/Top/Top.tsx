/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

export interface TopProps {
  className?: string;
  isLoading: boolean;
  signIn: () => Promise<void>;
}

export const Top: React.FC<TopProps> = ({ className, signIn }) => {
  return (
    <div className={className}>
      <h1>Follower Manager</h1>
      <button onClick={signIn}>ログイン</button>
    </div>
  );
};
