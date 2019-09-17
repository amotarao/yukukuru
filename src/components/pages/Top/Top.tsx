/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import imageDefault from '../../../assets/image_default.jpg';
import imageDark from '../../../assets/image_dark.jpg';
import { ThemeType } from '../../../stores/theme';
import { GitHubButton } from '../../organisms/GitHubButton';
import { TweetButton } from '../../organisms/TweetButton';
import { WrapperStyle, InnerStyle, ImageStyle, SignInButtonStyle, SocialButtonsStyle } from './styled';

export interface TopProps {
  isLoading: boolean;
  signIn: () => Promise<void>;
  theme: ThemeType;
}

export const Top: React.FC<TopProps> = ({ isLoading, signIn, theme }) => {
  return isLoading ? (
    <p>読み込み中</p>
  ) : (
    <div css={WrapperStyle}>
      <section css={InnerStyle}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 'normal', marginBottom: 16 }}>ゆくひとくるひと alpha</h1>
        <p style={{ fontSize: '0.8em', marginBottom: 16 }}>あなたのフォロワーを管理します</p>
        <div css={ImageStyle}>{theme !== 'dark' ? <img src={imageDefault} alt="利用イメージ" /> : <img src={imageDark} alt="利用イメージ" />}</div>
        <button css={SignInButtonStyle} onClick={signIn}>
          Twitter連携してはじめる
        </button>
        <p style={{ fontSize: '0.6em', marginTop: 16, color: '#999', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ whiteSpace: 'nowrap' }}>※ 現在テスト版のため不具合が発生する場合があります。</span>
        </p>
        <p style={{ fontSize: '0.6em', marginTop: 4, marginBottom: 8, color: '#999', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ whiteSpace: 'nowrap' }}>※ データ取得までに時間が掛かります。</span>
          <span style={{ whiteSpace: 'nowrap' }}>気長にお待ちください。</span>
        </p>
        <div css={SocialButtonsStyle}>
          <TweetButton />
          <GitHubButton />
        </div>
      </section>
    </div>
  );
};
