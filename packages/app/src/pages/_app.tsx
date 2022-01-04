import { StylesProvider } from '@mui/styles';
import { logEvent } from 'firebase/analytics';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import React, { useEffect } from 'react';
import { analytics } from '../modules/firebase';
import { ThemeContainer } from '../store/theme';
import '../styles/globals.css';

const MyApp: React.FC<AppProps> = ({ Component, pageProps, router }) => {
  useEffect(() => {
    const handleRouteChange = () => {
      logEvent(analytics, 'page_view');
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

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
