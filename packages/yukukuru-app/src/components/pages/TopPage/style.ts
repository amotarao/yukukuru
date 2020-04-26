import { css } from '@emotion/core';

export const style = {
  container: css`
    min-height: 100vh;
    padding: 0 0.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  `,

  main: css`
    text-align: center;
  `,

  title: css`
    margin: 0;
    line-height: 1.15;
    font-size: 4rem;
    text-align: center;
  `,

  button: css`
    text-transform: initial;
    margin-top: 16px;
  `,
};
