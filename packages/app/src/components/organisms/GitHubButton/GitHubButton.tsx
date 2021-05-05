/** @jsxImportSource @emotion/react */
import React from 'react';
import ReactGitHubButton from 'react-github-btn';
import * as style from './style';

interface GitHubButtonProps {
  size?: 'normal' | 'large';
}

export const GitHubButton: React.FC<GitHubButtonProps> = ({ size = 'normal' }) => {
  const isNormal = size === 'normal';

  return (
    <div css={style.wrapper} data-size={isNormal ? undefined : size}>
      <ReactGitHubButton
        href="https://github.com/amotarao/yukukuru"
        data-icon="octicon-star"
        aria-label="Star amotarao/yukukuru on GitHub"
      >
        Star
      </ReactGitHubButton>
    </div>
  );
};
