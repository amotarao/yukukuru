/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

export interface MyProps {
  className?: string;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export const My: React.FC<MyProps> = ({ className, signOut }) => {
  return (
    <div className={className}>
      <button onClick={signOut}>ログアウト</button>
    </div>
  );
};
