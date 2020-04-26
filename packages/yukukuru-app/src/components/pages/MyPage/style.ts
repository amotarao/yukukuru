import { css } from '@emotion/core';

export const style = {
  wrapper: css`
    padding: 0 calc(50% - 240px) 80px;

    @media screen and (min-width: 640px) {
      padding: 0 calc(50% - 480px);
    }
  `,

  header: css`
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
  `,

  signOutButton: css`
    appearance: none;
    background: var(--danger);
    border: none;
    border-radius: 4px;
    color: var(--back);
    cursor: pointer;
    font-size: 0.8rem;
    line-height: 1;
    padding: 8px 16px;
  `,

  mainArea: css`
    background: none;
    padding-bottom: 40px;

    @media screen and (min-width: 640px) {
      background: linear-gradient(to bottom, var(--back-2), var(--back-2)) center center/2px 1px repeat-y;
      padding-bottom: 80px;
    }
  `,

  labelNav: css`
    margin: 0 16px 16px;
    pointer-events: none;
    position: sticky;
    top: 16px;
    width: auto;
    z-index: 100;

    > ul {
      display: flex;
      justify-content: space-between;
      list-style: none;

      > li {
        border-radius: 8px;
        box-shadow: 0 1px 2px 0 var(--shadow);
        display: inline-block;
        font-size: 0.8rem;
        padding: 4px 16px;

        &[data-type='yuku'] {
          background: linear-gradient(to right, var(--yuku) 0%, var(--yuku) 100%) left/8px 1px repeat-y var(--back);
        }
        &[data-type='kuru'] {
          background: linear-gradient(to right, var(--kuru) 0%, var(--kuru) 100%) right/8px 1px repeat-y var(--back);
        }
      }
    }

    @media screen and (min-width: 640px) {
      margin-bottom: 24px;

      > ul {
        justify-content: space-around;

        > li {
          border-radius: 9999px;

          &[data-type='yuku'] {
            background: var(--yuku);
            margin-right: 32px;
          }
          &[data-type='kuru'] {
            background: var(--kuru);
            margin-left: 32px;
          }
        }
      }
    }
  `,

  recordHead: css`
    background: var(--primary);
    color: var(--back);
    font-size: 0.8rem;
    font-weight: normal;
    margin: 8px auto;
    padding: 4px 16px;
    flex: 0 0 100%;
    text-align: center;
    width: fit-content;
    border-radius: 9999px;
    letter-spacing: 0.1em;

    *:not(nav) + & {
      margin-top: 40px;

      @media screen and (min-width: 640px) {
        margin-top: 80px;
      }
    }
  `,

  userSection: css`
    flex: 1 0 300px;
    display: flex;
    position: relative;
    pointer-events: none;

    &[data-type='yuku'] {
      background: linear-gradient(
          to right,
          transparent 0%,
          transparent 20%,
          var(--yuku) 20%,
          var(--yuku) 50%,
          transparent 50%
        )
        center center/100% 2px no-repeat;
      justify-content: flex-start;

      &::before {
        background: var(--yuku);
      }
    }

    &[data-type='kuru'] {
      background: linear-gradient(
          to left,
          transparent 0%,
          transparent 20%,
          var(--kuru) 20%,
          var(--kuru) 50%,
          transparent 50%
        )
        center center/100% 2px no-repeat;
      justify-content: flex-end;

      &::before {
        background: var(--kuru);
      }
    }

    &::before {
      display: block;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      height: 12px;
      width: 12px;
      border-radius: 50%;

      @media screen and (min-width: 640px) {
        content: '';
      }
    }

    &[data-type='yuku'] + &[data-type='kuru'],
    &[data-type='kuru'] + &[data-type='yuku'] {
      @media screen and (min-width: 640px) {
        margin-top: -64px;
      }
    }

    & > * {
      pointer-events: initial;
    }
  `,

  getNextButton: css`
    appearance: none;
    background: var(--primary);
    border: none;
    border-radius: 4px;
    color: var(--back);
    cursor: pointer;
    font-size: 1rem;
    height: 48px;
    margin: 40px 16px;
    width: calc(100% - 32px);

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `,

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
