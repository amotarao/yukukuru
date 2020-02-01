import { css } from '@emotion/core';

export const NavStyle = css`
  & {
    align-items: center;
    background: var(--back);
    box-shadow: 0 -2px 4px 0 var(--shadow);
    display: flex;
    height: 48px;
    justify-content: flex-end;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 999;

    > ul {
      display: flex;
      list-style: none;
      height: 100%;
      width: 100%;

      > li {
        flex: 1 0 25%;
        display: flex;
        align-items: center;
        justify-content: center;

        &.user {
          border: 4px solid var(--primary);
          border-radius: 50%;
          box-shadow: 0 -2px 4px 0 var(--shadow);
          flex: 0 0 80px;
          height: 80px;
          overflow: hidden;
          margin-top: -20px;

          a {
            background: orange;
            display: flex;
            height: 100%;
            width: 100%;

            img {
              max-height: 100%;
              max-width: 100%;
            }
          }
        }
      }
    }
  }
`;

export const SignOutButtonStyle = css`
  & {
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
