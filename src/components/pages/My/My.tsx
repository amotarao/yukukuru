/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

export interface MyProps {
  className?: string;
  isLoading: boolean;
}

export const My: React.FC<MyProps> = ({ className }) => {
  return <div className={className}></div>;
};
