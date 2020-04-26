import { StylesProvider } from '@material-ui/core/styles';
import App from 'next/app';
import Head from 'next/head';
import React from 'react';
import { AuthContainer } from '../store/auth';
import { ThemeContainer } from '../store/theme';
import { GlobalStyle } from '../components/GlobalStyle';

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
            <GlobalStyle />
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
