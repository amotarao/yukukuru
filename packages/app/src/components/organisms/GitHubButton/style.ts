import { css } from '@emotion/react';

export const wrapper = css`
  height: 20px;
  width: 50px;

  &[data-size='large'] {
    height: 28px;
    width: 64px;
  }

  iframe {
    display: block;
  }
`;
