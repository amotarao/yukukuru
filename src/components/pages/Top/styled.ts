import { css } from '@emotion/core';

export const WrapperStyle = css`
  && {
    align-items: center;
    background-image: linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%);
    display: flex;
    min-height: 100vh;
    min-width: 100vw;
    justify-content: center;
    padding: 0 calc(50% - 240px);
  }
`;

export const InnerStyle = css`
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

export const SignInButtonStyle = css`
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

export const SocialButtonsStyle = css`
  && {
    display: flex;
    margin: 16px 0 0;

    > * {
      margin: 0 8px;
    }
  }
`;
