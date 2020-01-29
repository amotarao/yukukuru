import { css } from '@emotion/core';

export const NavStyle = css`
  && {
    align-items: center;
    background: var(--back);
    box-shadow: 0 -2px 4px 0 var(--shadow);
    display: flex;
    height: 64px;
    justify-content: flex-end;
    padding: 0 16px constant(safe-area-inset-bottom);
    padding: 0 16px env(safe-area-inset-bottom);
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 999;

    & > :first-child {
      flex: 1 0 auto;
    }
    & > :nth-child(2) {
      margin-right: 8px;
    }
  }
`;

export const SignOutButtonStyle = css`
  && {
    appearance: none;
    background: var(--danger);
    border: none;
    border-radius: 4px;
    color: var(--back);
    cursor: pointer;
    font-size: 0.8rem;
    line-height: 1;
    padding: 8px 16px;
  }
`;
