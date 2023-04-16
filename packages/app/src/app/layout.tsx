import { Metadata } from 'next';
import Script from 'next/script';
import { AuthProvider } from '../lib/auth/context';
import { FirebaseAnalytics } from './FirebaseAnalytics';
import ThemeProvider from './theme-context';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'ゆくくる',
  description: 'Twitterのフォロワーがいつきたか・いなくなったかを記録します',
  alternates: { canonical: process.env.NEXT_PUBLIC_PUBLIC_URL },
  openGraph: {
    title: 'ゆくくる',
    description: 'Twitterのフォロワーがいつきたか・いなくなったかを記録します',
    url: process.env.NEXT_PUBLIC_PUBLIC_URL,
    images: {
      url: `${process.env.NEXT_PUBLIC_PUBLIC_URL}/ogp.jpg`,
    },
    type: 'website',
  },
  twitter: {
    title: 'ゆくくる',
    description: 'Twitterのフォロワーがいつきたか・いなくなったかを記録します',
    images: {
      url: `${process.env.NEXT_PUBLIC_PUBLIC_URL}/ogp.jpg`,
    },
    card: 'summary_large_image',
  },
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2196f3',
};

export default function RootLayout({ children }: { children?: React.ReactNode }) {
  return (
    <html lang="ja-jp">
      <Script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default'));`,
        }}
      />
      <body>
        <FirebaseAnalytics />
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
