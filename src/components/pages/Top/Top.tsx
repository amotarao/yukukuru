/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

export interface TopProps {
  className?: string;
  isLoading: boolean;
}

export const Top: React.FC<TopProps> = ({ className }) => {
  return (
    <div className={className}>
      <h1>Follower Manager</h1>
      <a href="">ログイン</a>
    </div>
  );
};
