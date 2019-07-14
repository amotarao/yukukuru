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
    background: rgba(255, 255, 255, 0.8);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 32px 0;
    min-height: 60vh;
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
    background: #55acee;
    border: none;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
    font-size: 0.8rem;
    line-height: 1;
    padding: 8px 16px;
  }
`;
