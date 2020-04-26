import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';

export type ThemeType = 'default' | 'dark';

const useTheme = () => {
  const isDark = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : 'default';
  const localTheme = typeof window !== 'undefined' ? (localStorage.getItem('theme') as ThemeType | null) : null;

  const init: ThemeType = isDark ? 'dark' : 'default';
  const [theme, setTheme] = useState<ThemeType>(localTheme || init);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return {
    theme,
    setTheme,
  };
};

export type ThemeStoreType = ReturnType<typeof useTheme>;

export const ThemeContainer = createContainer(useTheme);
