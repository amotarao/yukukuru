import { css } from '@emotion/core';

export const WrapperStyle = css`
  && {
    padding: 0 calc(50% - 240px);
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

export const RecordHeadStyle = css`
  && {
    background: linear-gradient(to bottom, transparent 0%, transparent 60%, #eee 60%, #eee 100%);
    font-size: 1.2rem;
    font-weight: normal;
    padding: 0 16px;
    margin: 8px 0;
  }
`;

export const DurationStyle = css`
  && {
    color: #999;
    font-size: 0.8rem;
    margin: 8px 16px;
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

export const LeftHeadStyle = css`
  && {
    background: linear-gradient(to bottom, transparent 0%, transparent 60%, #ffcdd2 60%, #ffcdd2 100%);
    font-size: 0.8rem;
    font-weight: normal;
    margin: 24px 0 16px;
    padding: 0 16px;
  }
`;

export const EmptyTextStyle = css`
  && {
    font-size: 0.8rem;
    margin: 16px;
  }
`;
