import { css } from '@emotion/react';

export const wrapper = css`
  height: 20px;
  width: 75px;

  &[data-size='large'] {
    height: 28px;
    width: 93px;
  }

  iframe {
    display: block;
  }
`;
