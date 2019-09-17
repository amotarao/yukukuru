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
    --shadow: rgba(0, 0, 0, 0.19);
    --back-shadow: rgba(255, 255, 255, 0.8);
    --primary: #2196f3;
    --yuku: #ffcdd2;
    --kuru: #bbdefb;
    --danger: #ef5350;
  }

  html[data-dark='true'] {
    --main: #ccc;
    --sub: #999;
    --back: #111;
    --back-2: #222;
    --shadow: rgba(255, 255, 255, 0.4);
    --back-shadow: rgba(0, 0, 0, 0.8);
    --primary: #2196f3;
    --yuku: #b71c1c;
    --kuru: #0d47a1;
    --danger: #e53935;
  }

  html {
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Yu Gothic', YuGothic, Verdana, Meiryo, 'M+ 1p', sans-serif;
    font-size: 16px;
  }

  html,
  body {
    background: var(--back);
    color: var(--main);
    height: 100%;
    width: 100%;
  }

  img,
  svg {
    display: block;
  }
`;

export const GlobalStyle: React.FC = () => <Global styles={GlobalCSS} />;
