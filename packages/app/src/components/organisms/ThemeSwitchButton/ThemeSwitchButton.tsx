/** @jsxImportSource @emotion/react */
import React from 'react';
import { ThemeType, ThemeStoreType } from '../../../store/theme';
import * as style from './style';

export interface ThemeSwitchButtonProps {
  theme: ThemeType;
  setTheme: ThemeStoreType['setTheme'];
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
    <button css={style.button} onClick={isDefault ? setDark : setDefault}>
      {children}
    </button>
  );
};
