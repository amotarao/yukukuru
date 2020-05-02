/** @jsx jsx */
import { jsx } from '@emotion/core';
import { style } from './style';

export interface ErrorWrapperProps {
  text: string;
}

export const ErrorWrapper: React.FC<ErrorWrapperProps> = (props) => {
  return <div css={style.errorWrapper}>{props.text}</div>;
};
