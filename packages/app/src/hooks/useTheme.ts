import { useState, useEffect } from 'react';

export type ThemeType = 'default' | 'dark';

export const useTheme = () => {
  const [isLoading, setLoading] = useState<boolean>(typeof window !== 'undefined');
  const [theme, setTheme] = useState<ThemeType>('default');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const init: ThemeType = isDark ? 'dark' : 'default';
    setTheme((localStorage.getItem('theme') as ThemeType | null) || init);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (isLoading) {
      setLoading(false);
      return;
    }

    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [isLoading, theme]);

  return {
    theme,
    setTheme,
  };
};
