/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { WrapperStyle, InnerStyle, SignInButtonStyle } from './styled';
import image from '../../../assets/image.png';

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
        <img src={image} alt="利用イメージ" style={{ width: 120, marginBottom: 16, borderRadius: 4, boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.19)' }} />
        <button css={SignInButtonStyle} onClick={signIn}>
          Twitter連携してはじめる
        </button>
        <p style={{ fontSize: '0.6em', marginTop: 32 }}>
          <a href="https://github.com/amotarao/follower-manager" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3' }}>
            GitHub
          </a>
        </p>
        <p style={{ fontSize: '0.6em', marginTop: 16, color: '#999', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ whiteSpace: 'nowrap' }}>※ 現在テスト版のため不具合が発生する場合や、</span>
          <span style={{ whiteSpace: 'nowrap' }}>サービスを終了する場合があります。</span>
        </p>
        <p style={{ fontSize: '0.6em', marginTop: 8, color: '#999', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ whiteSpace: 'nowrap' }}>※ データ取得までに時間が掛かります。</span>
          <span style={{ whiteSpace: 'nowrap' }}>気長にお待ちください。</span>
        </p>
      </section>
    </div>
  );
};
