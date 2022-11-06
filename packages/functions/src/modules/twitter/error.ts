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
 * @param errors エラーリスト
 * @param code エラーコード
 *
 * @see https://developer.twitter.com/ja/docs/basics/response-codes
 */
const checkError = (error: ApiResponseError, code: number): boolean => {
  return error.data.errors?.some((error) => 'code' in error && error.code === code) ?? false;
};

/**
 * No user matches for specified terms.
 *
 * @param errors エラーリスト
 */
export const checkNoUserMatches = (error: ApiResponseError): boolean => {
  return checkError(error, EApiV1ErrorCode.NoUserMatch);
};

/**
 * Rate limit exceeded
 *
 * @param errors エラーリスト
 */
export const checkRateLimitExceeded = (error: ApiResponseError): boolean => {
  return checkError(error, EApiV1ErrorCode.RateLimitExceeded);
};

/**
 * Invalid or expired token
 *
 * @param errors エラーリスト
 */
export const checkInvalidOrExpiredToken = (error: ApiResponseError): boolean => {
  return checkError(error, EApiV1ErrorCode.InvalidOrExpiredToken);
};

/**
 * To protect our users from spam and other malicious activity, this account is temporarily locked.
 *
 * @param errors エラーリスト
 */
export const checkTemporarilyLocked = (error: ApiResponseError): boolean => {
  return checkError(error, EApiV1ErrorCode.AccountLocked);
};
