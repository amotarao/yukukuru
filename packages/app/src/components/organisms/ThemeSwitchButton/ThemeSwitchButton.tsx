/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { ButtonStyle } from './styled';
import { ThemeType } from '../../../stores/theme';

export interface ThemeSwitchButtonProps {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

export const ThemeSwitchButton: React.FC<ThemeSwitchButtonProps> = ({ children = 'テーマ変更', theme, setTheme }) => {
  const isDefault = theme === 'default';

  const setDefault = () => {
    setTheme('default');
  };
  const setDark = () => {
    setTheme('dark');
  };

  return (
    <button css={ButtonStyle} onClick={isDefault ? setDark : setDefault}>
      {children}
    </button>
  );
};
