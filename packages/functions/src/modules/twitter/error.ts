import { ApiResponseError, EApiV1ErrorCode } from 'twitter-api-v2';

const logError = (error: unknown): void => {
  if (error && typeof error === 'object' && 'message' in error && error.message && typeof error.message === 'string') {
    console.error(`❗️[Twitter Error] Failed to run Twitter API: ${error.message}.`);
    return;
  }

  console.error(`❗️[Twitter Error] Failed to run Twitter API: check next line.`);
  console.error(error);
};

export const twitterClientErrorHandler = (error: unknown): { error: ApiResponseError } => {
  logError(error);

  if (error && error instanceof ApiResponseError) {
    return { error };
  }

  throw error;
};

/**
 * エラーコードを確認
 *
 * @param error エラー
 * @param code エラーコード
 *
 * @see https://developer.twitter.com/ja/docs/basics/response-codes
 */
const checkError = (error: ApiResponseError, code: number): boolean => {
  return error.hasErrorCode(code);
};

export const checkNoUserMatches = (error: ApiResponseError): boolean => {
  return checkError(error, EApiV1ErrorCode.NoUserMatch);
};

export const checkRateLimitExceeded = (error: ApiResponseError): boolean => {
  return checkError(error, EApiV1ErrorCode.RateLimitExceeded);
};

export const checkInvalidOrExpiredToken = (error: ApiResponseError): boolean => {
  return checkError(error, EApiV1ErrorCode.InvalidOrExpiredToken);
};

export const checkTemporarilyLocked = (error: ApiResponseError): boolean => {
  return checkError(error, EApiV1ErrorCode.AccountLocked);
};
