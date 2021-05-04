import { css } from '@emotion/react';

export const wrapper = css`
  background: var(--back);
  border-radius: 8px;
  box-shadow: 0 2px 4px 0 var(--shadow);
  color: inherit;
  display: block;
  margin: 16px;
  padding: 16px;
  text-decoration: none;
  transition: box-shadow 0.3s ease-out;
  max-width: 400px;
  width: 80%;

  @media screen and (max-width: 639px) {
    &[data-type='yuku'] {
      background: linear-gradient(to right, var(--yuku) 0%, var(--yuku) 100%) left/8px 1px repeat-y var(--back);
    }
    &[data-type='kuru'] {
      background: linear-gradient(to right, var(--kuru) 0%, var(--kuru) 100%) right/8px 1px repeat-y var(--back);
    }
  }

  @media screen and (min-width: 640px) {
    max-width: calc(50% - 40px);
    width: 400px;
  }

  &:hover {
    box-shadow: 0 4px 8px 0 var(--shadow);
  }
`;

export const iconWrapper = css`
  border-radius: 50%;
  float: left;
  height: 48px;
  overflow: hidden;
  width: 48px;

  img {
    height: 100%;
    width: 100%;
  }
`;

export const name = css`
  font-size: 1.2rem;
  line-height: 1.5;
  margin-left: 64px;
  margin-bottom: 4px;
`;

export const screenName = css`
  font-size: 0.8rem;
  font-weight: bold;
  line-height: 1.2;
  margin-left: 64px;
`;

export const notFoundedText = css`
  font-size: 0.8rem;
  margin-top: 8px;
  margin-left: 64px;
`;

export const durationText = css`
  color: var(--sub);
  font-size: 0.8rem;
  margin-top: 8px;
  margin-left: 64px;
`;

export const noDetailWrapper = css`
  background: var(--back);
  border-radius: 8px;
  box-shadow: 0 2px 4px 0 var(--shadow);
  display: block;
  margin: 16px;
  padding: 16px;
  max-width: 400px;
  width: 80%;

  @media screen and (max-width: 639px) {
    &[data-type='yuku'] {
      background: linear-gradient(to right, var(--yuku) 0%, var(--yuku) 100%) left/8px 1px repeat-y var(--back);
    }
    &[data-type='kuru'] {
      background: linear-gradient(to right, var(--kuru) 0%, var(--kuru) 100%) right/8px 1px repeat-y var(--back);
    }
  }

  @media screen and (min-width: 640px) {
    max-width: calc(50% - 40px);
    width: 400px;
  }

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
`;
