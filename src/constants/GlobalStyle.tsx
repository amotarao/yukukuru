import React from 'react';
import { Global, css } from '@emotion/core';

const GlobalCSS = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Yu Gothic', YuGothic, Verdana, Meiryo, 'M+ 1p', sans-serif;
    font-size: 16px;
  }

  html,
  body {
    height: 100%;
    width: 100%;
  }

  img,
  svg {
    display: block;
  }
`;

export const GlobalStyle: React.FC = () => <Global styles={GlobalCSS} />;
