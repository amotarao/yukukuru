import { css } from '@emotion/core';

export const NavStyle = css`
  && {
    align-items: center;
    display: flex;
    height: 48px;
    justify-content: flex-end;
    margin-bottom: 16px;
    padding: 0 16px;

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
