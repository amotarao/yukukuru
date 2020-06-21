/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { style } from './style';

export const LoadingCircle: React.FC = () => {
  return <div css={style.loading}>読み込み中</div>;
};
