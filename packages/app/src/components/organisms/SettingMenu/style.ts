import { css } from '@emotion/core';

export const style = {
  list: css`
    list-style: none;
  `,

  item: css`
    border-bottom: 1px solid var(--back-2);
  `,

  card: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 3.2rem;
    padding: 0 1rem;
    appearance: none;
    background: none;
    width: 100%;
    border: none;
    color: inherit;
    font-size: 1rem;
    font-family: inherit;

    button& {
      cursor: pointer;
    }
  `,

  twitter: css`
    margin-top: 1rem;
    padding: 1rem;

    a {
      color: var(--primary);
      text-decoration: none;
    }

    * + * {
      margin-top: 2rem;
    }
  `,
};
