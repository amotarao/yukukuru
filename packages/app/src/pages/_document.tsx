import Document, { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';
import { GlobalStyle } from '../components/GlobalStyle';

export default class MyDocument extends Document {
  render(): JSX.Element {
    return (
      <Html lang="ja-jp">
        <GlobalStyle />
        <Head>
          <script
            dangerouslySetInnerHTML={{
              __html: `document.documentElement.setAttribute('data-theme', localStorage.getItem('theme'));`,
            }}
          />
          <meta name="theme-color" content="#000000" />
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
      </Html>
    );
  }
}
