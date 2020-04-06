import { css } from '@emotion/core';

export const wrapper = css`
  && {
    align-items: center;
    background-image: var(--primary-gradient);
    display: flex;
    min-height: 100vh;
    min-width: 100vw;
    justify-content: center;
    padding: 0 calc(50% - 240px);
  }
`;

export const inner = css`
  && {
    align-items: center;
    background: var(--back-shadow);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 560px;
    padding: 16px;
    text-align: center;
    width: 100%;

    p {
      font-size: 0.8rem;
    }
  }
`;

export const image = css`
  && {
    border-radius: 4px;
    box-shadow: 0 2px 4px 0 var(--shadow);
    height: 240px;
    margin-bottom: 16px;
    width: 180px;

    img {
      max-height: 100%;
      max-width: 100%;
      vertical-align: bottom;
    }
  }
`;

export const signInButton = css`
  && {
    appearance: none;
    background: var(--primary);
    border: none;
    border-radius: 4px;
    color: var(--back);
    cursor: pointer;
    font-size: 0.8rem;
    line-height: 1;
    padding: 8px 16px;
  }
`;

export const socialButtons = css`
  && {
    display: flex;
    margin: 16px 0 0;

    > * {
      margin: 0 8px;
    }
  }
`;
