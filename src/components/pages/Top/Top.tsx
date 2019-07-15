/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import image from '../../../assets/image.png';
import { WrapperStyle, InnerStyle, SignInButtonStyle, SocialButtonsStyle } from './styled';
import { GitHubButton } from '../../organisms/GitHubButton';
import { TweetButton } from '../../organisms/TweetButton';

export interface TopProps {
  isLoading: boolean;
  signIn: () => Promise<void>;
}

export const Top: React.FC<TopProps> = ({ isLoading, signIn }) => {
  return isLoading ? (
    <p>読み込み中</p>
  ) : (
    <div css={WrapperStyle}>
      <section css={InnerStyle}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 'normal', marginBottom: 16 }}>ゆくひとくるひと alpha</h1>
        <p style={{ fontSize: '0.8em', marginBottom: 16 }}>あなたのフォロワーを管理します</p>
        <img
          src={image}
          alt="利用イメージ"
          style={{ width: 128, height: 227, marginBottom: 16, borderRadius: 4, boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.19)' }}
        />
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
