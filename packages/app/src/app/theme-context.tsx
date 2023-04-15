'use client';

import { ThemeContainer } from '../store/theme';

export default function ThemeProvider({ children }: { children?: React.ReactNode }) {
  return <ThemeContainer.Provider>{children}</ThemeContainer.Provider>;
}
