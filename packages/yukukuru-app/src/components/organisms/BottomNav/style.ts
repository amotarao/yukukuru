import { css } from '@emotion/core';

export const style = {
  nav: css`
    background: var(--back);
    border-top: 1px solid var(--shadow);
    width: 100%;
    position: fixed;
    left: 0;
    bottom: 0;
    font-size: 14px;

    a {
      color: var(--primary);
    }
  `,

  list: css`
    display: flex;
    justify-content: center;
    max-width: 640px;
    margin: 0 auto;
    list-style: none;
  `,

  item: css`
    flex: 1 0 50px;
  `,

  button: css`
    appearance: none;
    background: none;
    border: none;
    color: var(--sub);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    padding: 0.4rem 0;
    padding: 0.4rem 0 calc(0.4rem + constant(safe-area-inset-bottom));
    padding: 0.4rem 0 calc(0.4rem + env(safe-area-inset-bottom));
    transition: height 0.3s ease-out, padding 0.3s ease-out;
    font-size: 0.6rem;

    &[aria-selected='true'] {
      color: var(--primary);
    }

    svg {
      font-size: 1.75rem;
    }
  `,
};
