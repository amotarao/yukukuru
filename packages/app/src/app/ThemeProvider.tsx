'use client';

import { ThemeContainer } from '../store/theme';

export const ThemeProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <ThemeContainer.Provider>{children}</ThemeContainer.Provider>;
};
