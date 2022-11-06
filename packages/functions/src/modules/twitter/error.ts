import { ApiPartialResponseError, ApiRequestError, ApiResponseError, EApiV1ErrorCode } from 'twitter-api-v2';

const logError = (error: unknown): void => {
  try {
    const detail = JSON.stringify(error);
    console.error(`❗️[Twitter Error] Failed to run Twitter API: ${detail}`);
  } catch (e) {
    console.error(`❗️[Twitter Error] Failed to run Twitter API. (Check next log.)`);
    console.error(error);
  }
};

export const twitterClientErrorHandler = (
  error: ApiRequestError | ApiPartialResponseError | ApiResponseError
): { error: ApiResponseError } => {
  logError(error);

  if (error instanceof ApiRequestError || error instanceof ApiPartialResponseError) {
    throw error;
  }

  return { error };
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
