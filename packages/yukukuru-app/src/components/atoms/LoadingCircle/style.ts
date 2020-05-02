import { css, keyframes } from '@emotion/core';

const loading = keyframes`
0% {
  transform: rotate(0deg);
}
100% {
  transform: rotate(360deg);
}
`;

export const style = {
  loading: css`
    margin: 60px auto;
    position: relative;
    text-indent: -9999em;
    border-top: 0.3rem solid var(--back-shadow);
    border-right: 0.3rem solid var(--back-shadow);
    border-bottom: 0.3rem solid var(--back-shadow);
    border-left: 0.3rem solid var(--sub);
    transform: translateZ(0);
    animation: ${loading} 1.2s infinite linear;

    &,
    &.loader:after {
      border-radius: 50%;
      width: 5rem;
      height: 5rem;
    }
  `,
};
