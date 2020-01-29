/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import MediaQuery from 'react-responsive';
import { TweetButton } from '../TweetButton';
import { ThemeSwitchButtonContainer } from '../ThemeSwitchButton';
import { NavStyle, SignOutButtonStyle } from './styled';

interface SiteNavProps {
  signOut: () => Promise<void>;
}

export const SiteNav: React.FC<SiteNavProps> = ({ signOut }) => {
  return (
    <nav css={NavStyle}>
      <TweetButton size="large" />
      <ThemeSwitchButtonContainer>
        <MediaQuery minWidth={375}>{(matches: boolean) => (matches ? 'テーマを変更' : 'テーマ')}</MediaQuery>
      </ThemeSwitchButtonContainer>
      <button css={SignOutButtonStyle} onClick={signOut}>
        ログアウト
      </button>
    </nav>
  );
};
