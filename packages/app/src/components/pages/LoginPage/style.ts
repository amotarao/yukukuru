import { css } from '@emotion/react';

export const style = {
  wrapper: css`
    text-align: center;
    padding: 40px calc(50% - 240px) 0;

    @media screen and (min-width: 640px) {
      padding: 40px calc(50% - 480px) 0;
    }
  `,

  loginButton: css`
    text-transform: initial;
    margin-bottom: 1rem;
    color: var(--primary);
    border-color: var(--primary);

    &:disabled {
      color: var(--sub);
      border-color: var(--sub);
    }
  `,

  topButton: css`
    text-transform: initial;
    margin-bottom: 1rem;
    color: var(--sub);
    border-color: var(--sub);
  `,
};
