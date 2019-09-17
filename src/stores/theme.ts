import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';

type Theme = 'default' | 'dark';

const useTheme = () => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const init: Theme = isDark ? 'dark' : 'default';
  const [theme, setTheme] = useState<Theme>((localStorage.getItem('theme') as Theme | null) || init);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return {
    setTheme,
  };
};

export const ThemeContainer = createContainer(useTheme);
