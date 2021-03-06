/** @jsxImportSource @emotion/react */
import React from 'react';
import { style } from './style';

export type ErrorWrapperProps = {
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

export const ErrorWrapper: React.FC<ErrorWrapperProps> = (props) => {
  return (
    <div css={style.errorWrapper} onClick={props.onClick}>
      {props.children}
    </div>
  );
};
