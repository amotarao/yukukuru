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

  :root {
    --main: #333;
    --sub: #999;
    --back: #fff;
    --back-2: #eee;
    --primay: #2196f3;
    --yuku: #ffcdd2;
    --kuru: #bbdefb;
    --danger: #ef5350;
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
