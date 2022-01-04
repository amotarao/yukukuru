import { StylesProvider } from '@material-ui/core/styles';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import React from 'react';
import * as gtag from '../libs/gtag';
import { ThemeContainer } from '../store/theme';
import '../styles/globals.css';

Router.events.on('routeChangeComplete', (url) => {
  gtag.pageview(url);
});

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <ThemeContainer.Provider>
      <StylesProvider injectFirst>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Component {...pageProps} />
      </StylesProvider>
    </ThemeContainer.Provider>
  );
};

export default MyApp;
