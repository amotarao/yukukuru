import { css } from '@emotion/core';

export const WrapperStyle = css`
  && {
    border-radius: 8px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.19);
    color: inherit;
    display: block;
    margin: 16px;
    padding: 16px;
    text-decoration: none;
    transition: box-shadow 0.3s ease-out;

    &:hover {
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.19);
    }
  }
`;

export const IconWrapperStyle = css`
  && {
    border-radius: 50%;
    float: left;
    height: 48px;
    overflow: hidden;
    width: 48px;

    img {
      height: 100%;
      width: 100%;
    }
  }
`;

export const NameStyle = css`
  && {
    font-size: 1.2rem;
    line-height: 1.5;
    margin-left: 64px;
    margin-bottom: 4px;
  }
`;

export const ScreenNameStyle = css`
  && {
    font-size: 0.8rem;
    font-weight: bold;
    line-height: 1.2;
    margin-left: 64px;
  }
`;

export const NotFoundedTextStyle = css`
  && {
    font-size: 0.8rem;
    margin-top: 8px;
    margin-left: 64px;
  }
`;

export const DurationTextStyle = css`
  && {
    color: var(--sub);
    font-size: 0.8rem;
    margin-top: 8px;
    margin-left: 64px;
  }
`;

export const NoDetailWrapperStyle = css`
  && {
    border-radius: 8px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.19);
    display: block;
    margin: 16px;
    padding: 16px;

    .head {
      color: var(--main);
      font-size: 1rem;
      line-height: 1.5;
    }

    .text {
      color: var(--sub);
      font-size: 0.8rem;
      line-height: 1.5;
      margin-top: 4px;
    }

    .duration {
      color: var(--sub);
      font-size: 0.8rem;
      margin-top: 4px;
    }
  }
`;
