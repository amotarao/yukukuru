import { StylesProvider } from '@material-ui/core/styles';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';
import { ThemeContainer } from '../store/theme';
import '../styles/globals.css';

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
