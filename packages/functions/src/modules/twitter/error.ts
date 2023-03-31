import { ApiResponseError, EApiV1ErrorCode } from 'twitter-api-v2';

const logError = (error: unknown): void => {
  if (error && error instanceof ApiResponseError) {
    console.error(`❗️[Twitter Error] Failed to run Twitter API: "${error.message}", and check detail next line.`);
    console.error(`error: ${error}`);
    console.error(`data: ${JSON.stringify(error.data, null, 2)}`);
    console.error(`isAuthError: ${error.isAuthError}`);
    console.error(`rateLimitError: ${error.rateLimitError}`);
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
