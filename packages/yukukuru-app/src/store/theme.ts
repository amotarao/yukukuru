import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';

export type ThemeType = 'default' | 'dark';

const useTheme = () => {
  if (typeof window === 'undefined') {
    return {
      theme: 'default' as ThemeType,
      setTheme: (): void => {
        return undefined;
      },
    };
  }

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const init: ThemeType = isDark ? 'dark' : 'default';
  const [theme, setTheme] = useState<ThemeType>((localStorage.getItem('theme') as ThemeType | null) || init);

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
