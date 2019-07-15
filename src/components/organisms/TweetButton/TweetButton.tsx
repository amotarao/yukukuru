/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Share } from 'react-twitter-widgets';
import { ButtonStyle } from './styled';

export const TweetButton: React.FC = () => {
  return (
    <div css={ButtonStyle}>
      <Share
        url="https://yukukuru.app"
        options={{
          size: 'large',
          text: 'ゆくひとくるひと - フォロワー管理アプリ',
          via: 'yukukuru',
          hashtags: 'ゆくくる',
          lang: 'ja',
          showCount: false,
        }}
      />
    </div>
  );
};
