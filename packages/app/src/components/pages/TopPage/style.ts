import { css } from '@emotion/react';

export const style = {
  wrapper: css`
    align-items: center;
    background-image: var(--primary-gradient);
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 100%;
    justify-content: center;
    padding: 0;
    min-height: 800px;

    @media screen and (min-width: 640px) {
      min-height: 640px;
    }
  `,

  name: css`
    align-items: center;
    background: var(--back-shadow);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    width: 100%;

    p {
      font-size: 0.8rem;
    }
  `,

  main: css`
    text-align: center;
  `,

  title: css`
    font-size: 2rem;
    font-weight: normal;
    margin-bottom: 1rem;
  `,

  text: css`
    font-size: 1.2rem;
    margin-bottom: 1rem;
  `,

  button: css`
    text-transform: initial;
    margin-bottom: 1rem;
    color: var(--primary);
    border-color: var(--primary);

    &:disabled {
      color: var(--sub);
      border-color: var(--sub);
    }
  `,

  caution: css`
    font-size: 0.8rem;
    margin-top: 0.5rem;
    color: var(--sub);
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    white-space: nowrap;
  `,

  example: css`
    margin-top: 4rem;
    padding-bottom: 2rem !important;
    width: 100%;

    @media screen and (min-width: 640px) {
      max-width: 840px;
    }

    h2 {
      margin-top: 0;
    }
  `,
};
