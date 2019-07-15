/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import ReactGitHubButton from 'react-github-btn';
import { ButtonStyle } from './styled';

export const GitHubButton: React.FC = () => {
  return (
    <div css={ButtonStyle}>
      <ReactGitHubButton href="https://github.com/amotarao/yukukuru-app" data-icon="octicon-star" aria-label="Star amotarao/yukukuru-app on GitHub">
        Star
      </ReactGitHubButton>
    </div>
  );
};
