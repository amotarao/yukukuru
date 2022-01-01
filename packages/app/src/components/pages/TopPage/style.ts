import { css } from '@emotion/react';

export const style = {
  wrapper: css`
    min-height: 800px;

    @media screen and (min-width: 640px) {
      min-height: 640px;
    }
  `,

  button: css`
    text-transform: initial;
    margin-bottom: 1rem;
    color: var(--primary);
    border-color: var(--primary);

    &:disabled {
      color: var(--sub);
      border-color: var(--sub);
    }
  `,

  example: css`
    margin-top: 4rem;
    padding-bottom: 2rem !important;
    width: 100%;

    @media screen and (min-width: 640px) {
      max-width: 840px;
    }
  `,
};
