import { css, Global } from '@emotion/core';
import { StylesProvider } from '@material-ui/core/styles';
import App from 'next/app';
import Head from 'next/head';
import React from 'react';
import { AuthContainer } from '../store/auth';
import { ThemeContainer } from '../store/theme';

const globalStyle = css`
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
    --primary-gradient: linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%);
    --yuku: #ffcdd2;
    --kuru: #bbdefb;
    --danger: #ef5350;
  }

  html[data-theme='dark'] {
    --main: #ccc;
    --sub: #999;
    --back: #111;
    --back-2: #222;
    --shadow: rgba(255, 255, 255, 0.4);
    --back-shadow: rgba(0, 0, 0, 0.8);
    --primary: #2196f3;
    --primary-gradient: linear-gradient(120deg, #006d75 0%, #004099 100%);
    --yuku: #b71c1c;
    --kuru: #0d47a1;
    --danger: #e53935;
  }

  html {
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Yu Gothic', YuGothic, Verdana, Meiryo, 'M+ 1p',
      sans-serif;
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

export default class MyApp extends App {
  static async getInitialProps(ctx: any): Promise<any> {
    if (ctx.Component.getInitialProps) {
      const pageProps = await ctx.Component.getInitialProps(ctx);
      return { pageProps };
    }
    return {};
  }

  render(): JSX.Element {
    const { Component, pageProps } = this.props;

    return (
      <ThemeContainer.Provider>
        <AuthContainer.Provider>
          <StylesProvider injectFirst>
            <Global styles={globalStyle} />
            <Head>
              <link rel="icon" href="/favicon.ico" />
            </Head>
            <Component {...pageProps} />
          </StylesProvider>
        </AuthContainer.Provider>
      </ThemeContainer.Provider>
    );
  }
}
