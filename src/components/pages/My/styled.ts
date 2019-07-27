import { css } from '@emotion/core';

export const WrapperStyle = css`
  && {
    padding: 0 calc(50% - 240px);

    @media screen and (min-width: 720px) {
      padding: 0 calc(50% - 480px);
    }
  }
`;

export const HeaderStyle = css`
  && {
    align-items: center;
    display: flex;
    height: 48px;
    justify-content: flex-end;
    margin-bottom: 16px;
    padding: 0 16px;

    & > *:first-child {
      flex: 1 0 auto;
    }
  }
`;

export const SignOutButtonStyle = css`
  && {
    appearance: none;
    background: #ef5350;
    border: none;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
    font-size: 0.8rem;
    line-height: 1;
    padding: 8px 16px;
  }
`;

export const RecordSectionStyle = css`
  && {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 64px;
  }
`;

export const RecordHeadStyle = css`
  && {
    background: linear-gradient(to bottom, transparent 0%, transparent 60%, #eee 60%, #eee 100%);
    font-size: 1.2rem;
    font-weight: normal;
    margin: 8px 32px 8px 0;
    padding: 0 16px;
    flex: 0 0 100%;
  }
`;

export const CameSectionStyle = css`
  && {
    flex: 1 0 300px;

    @media screen and (min-width: 640px) {
      margin-right: 32px;
    }
  }
`;

export const CameHeadStyle = css`
  && {
    background: linear-gradient(to bottom, transparent 0%, transparent 60%, #bbdefb 60%, #bbdefb 100%);
    font-size: 0.8rem;
    font-weight: normal;
    margin: 16px 0;
    padding: 0 16px;
  }
`;

export const LeftSectionStyle = css`
  && {
    flex: 1 0 300px;
  }
`;

export const LeftHeadStyle = css`
  && {
    background: linear-gradient(to bottom, transparent 0%, transparent 60%, #ffcdd2 60%, #ffcdd2 100%);
    font-size: 0.8rem;
    font-weight: normal;
    margin: 16px 0;
    padding: 0 16px;
  }
`;

export const EmptyTextStyle = css`
  && {
    font-size: 0.8rem;
    margin: 16px;
  }
`;

export const ErrorWrapperStyle = css`
  && {
    border: 1px solid #f33;
    color: #f33;
    display: flex;
    flex-wrap: wrap;
    font-size: 0.8em;
    justify-content: center;
    margin: 16px;
    padding: 4;
  }
`;

export const GetNextButtonStyle = css`
  && {
    appearance: none;
    background: #2196f3;
    border: none;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
    font-size: 1rem;
    height: 48px;
    margin: 40px 16px 80px;
    width: calc(100% - 32px);

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
`;
