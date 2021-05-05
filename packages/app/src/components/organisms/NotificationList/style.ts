import { css } from '@emotion/react';

export const style = {
  list: css`
    list-style: none;
  `,

  item: css`
    border-bottom: 1px solid var(--back-2);
  `,

  card: css`
    display: block;
    color: inherit;
    text-decoration: none;
    padding: 1rem 1rem;
  `,

  name: css`
    margin-bottom: 0.5rem;
  `,

  text: css`
    font-size: 0.8rem;
    white-space: pre-line;

    svg {
      color: var(--sub);
      font-size: 1em;
      vertical-align: middle;
      margin-left: 0.2em;
    }
  `,
};
