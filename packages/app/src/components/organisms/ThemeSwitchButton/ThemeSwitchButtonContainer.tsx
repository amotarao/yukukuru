/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';
import React from 'react';
import { ThemeContainer } from '../../../store/theme';
import { ThemeSwitchButton } from '.';

export const ThemeSwitchButtonContainer: React.FC = ({ children }) => {
  const { theme, setTheme } = ThemeContainer.useContainer();

  return (
    <ThemeSwitchButton
      {...{
        children,
        theme,
        setTheme,
      }}
    />
  );
};
