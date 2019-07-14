/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

export interface TopProps {
  className?: string;
  isLoading: boolean;
  signIn: () => Promise<void>;
}

export const Top: React.FC<TopProps> = ({ className, isLoading, signIn }) => {
  return isLoading ? (
    <p>読み込み中</p>
  ) : (
    <div className={className}>
      <h1>Follower Manager (仮) alpha</h1>
      <p>人事ったーの後釜を目指しました</p>
      <p>alpha版のため、うまく動作しない場合があります</p>
      <p>サイトのデザインがされていませんが、あとでいい感じにやります</p>
      <p>
        <a href="https://github.com/amotarao/follower-manager" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </p>
      <button onClick={signIn}>
        <img src="https://developer.twitter.com/content/dam/developer-twitter/images/sign-in-with-twitter-gray.png" alt="Sign in with Twitter" />
      </button>
    </div>
  );
};
