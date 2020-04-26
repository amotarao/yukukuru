import { css } from '@emotion/core';

export const style = {
  nav: css`
    background: var(--back);
    box-shadow: 0 -2px 4px 0 var(--shadow);
    width: 100%;
    transition: height 0.3s ease-out;
    position: fixed;
    padding: 12px 16px 12px;
    padding: 12px 16px calc(12px + constant(safe-area-inset-bottom));
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
    left: 0;
    bottom: 0;
    font-size: 14px;

    a {
      color: var(--primary);
    }
  `,
};
