import { logEvent } from 'firebase/analytics';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import { useAnalytics } from '../modules/analytics';
import { ThemeContainer } from '../store/theme';
import '../styles/globals.css';

const MyApp: React.FC<AppProps> = ({ Component, pageProps, router }) => {
  const analytics = useAnalytics();

  useEffect(() => {
    const handleRouteChange = () => {
      analytics && logEvent(analytics, 'page_view');
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [analytics, router.events]);

  return (
    <ThemeContainer.Provider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </ThemeContainer.Provider>
  );
};

export default MyApp;
