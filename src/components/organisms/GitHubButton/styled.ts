import { css } from '@emotion/core';

export const ButtonStyle = css`
  && {
    height: 20px;
    width: 50px;

    &[data-size='large'] {
      height: 28px;
      width: 64px;
    }

    iframe {
      display: block;
    }
  }
`;
