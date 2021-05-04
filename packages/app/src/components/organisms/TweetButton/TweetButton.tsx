/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';
import React from 'react';
import { Share } from 'react-twitter-widgets';
import * as style from './style';

interface TweetButtonProps {
  size?: 'normal' | 'large';
}

export const TweetButton: React.FC<TweetButtonProps> = ({ size = 'normal' }) => {
  const isNormal = size === 'normal';

  return (
    <div css={style.wrapper} data-size={isNormal ? undefined : size}>
      <Share
        url="https://yukukuru.app"
        options={{
          text: 'ゆくくる - フォロワーがいつきたか・いなくなったかを記録します',
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
