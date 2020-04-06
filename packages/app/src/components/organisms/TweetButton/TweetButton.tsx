/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Share } from 'react-twitter-widgets';
import { ButtonStyle } from './styled';

interface TweetButtonProps {
  size?: 'normal' | 'large';
}

export const TweetButton: React.FC<TweetButtonProps> = ({ size = 'normal' }) => {
  const isNormal = size === 'normal';

  return (
    <div css={ButtonStyle} data-size={isNormal ? undefined : size}>
      <Share
        url="https://yukukuru.app"
        options={{
          text: 'ゆくひとくるひと - フォロワー管理アプリ',
          size: isNormal ? undefined : size,
          via: 'yukukuruapp',
          hashtags: 'ゆくくる',
          lang: 'ja',
          showCount: false,
        }}
      />
    </div>
  );
};
