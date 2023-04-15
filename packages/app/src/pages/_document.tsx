import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render(): JSX.Element {
    return (
      <Html lang="ja-jp">
        <Head>
          <script
            dangerouslySetInnerHTML={{
              __html: `document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default'));`,
            }}
          />
          <meta name="theme-color" content="#2196f3" />
          <meta name="description" content="Twitterのフォロワーがいつきたか・いなくなったかを記録します" />
          <meta property="og:url" content={process.env.NEXT_PUBLIC_PUBLIC_URL} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="ゆくくる" />
          <meta property="og:description" content="Twitterのフォロワーがいつきたか・いなくなったかを記録します" />
          <meta property="og:image" content={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/ogp.jpg`} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="ゆくくる" />
          <meta name="twitter:description" content="Twitterのフォロワーがいつきたか・いなくなったかを記録します" />
          <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/ogp.jpg`} />
          <link rel="canonical" href={process.env.NEXT_PUBLIC_PUBLIC_URL} />
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
