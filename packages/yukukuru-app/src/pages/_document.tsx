import Document, { Head, Main, NextScript } from 'next/document';
import React from 'react';
import { GlobalStyle } from '../components/GlobalStyle';

export default class MyDocument extends Document {
  render(): JSX.Element {
    return (
      <html lang="ja-jp">
        <GlobalStyle />
        <Head>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${process.env.GOOGLE_ANALYTICS});`,
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `document.documentElement.setAttribute('data-theme', localStorage.getItem('theme'));`,
            }}
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#000000" />
          <title>ゆくくる alpha</title>
          <meta name="description" content="フォロワーがいつきたか・いなくなったかを記録します" />
          <meta property="og:url" content={process.env.PUBLIC_URL} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="ゆくくる" />
          <meta property="og:description" content="フォロワーがいつきたか・いなくなったかを記録します" />
          <meta property="og:image" content={`${process.env.PUBLIC_URL}/ogp.jpg`} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="ゆくくる" />
          <meta name="twitter:description" content="フォロワーがいつきたか・いなくなったかを記録します" />
          <meta name="twitter:image" content={`${process.env.PUBLIC_URL}/ogp.jpg`} />
          <link rel="canonical" href={process.env.PUBLIC_URL} />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
