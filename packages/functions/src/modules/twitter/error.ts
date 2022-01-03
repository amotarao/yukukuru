export type TwitterClientError = {
  code: number;
  message: string;
};

export const twitterClientErrorHandler = (error: unknown): { errors: TwitterClientError[] } => {
  console.error(`❗️[Twitter Error] Failed to run Twitter API.`, error);

  if (Array.isArray(error)) {
    return { errors: error as TwitterClientError[] };
  }

  return { errors: [error] as TwitterClientError[] };
};

/**
 * エラーコードを確認
 *
 * @param errors エラーリスト
 * @param code エラーコード
 *
 * @see https://developer.twitter.com/ja/docs/basics/response-codes
 */
const checkError = (errors: TwitterClientError[], code: number) => {
  return errors.some((error) => error.code === code);
};

/**
 * No user matches for specified terms.
 *
 * @param errors エラーリスト
 */
export const checkNoUserMatches = (errors: TwitterClientError[]): boolean => {
  return checkError(errors, 17);
};

/**
 * Rate limit exceeded
 *
 * @param errors エラーリスト
 */
export const checkRateLimitExceeded = (errors: TwitterClientError[]): boolean => {
  return checkError(errors, 88);
};

/**
 * Invalid or expired token
 *
 * @param errors エラーリスト
 */
export const checkInvalidOrExpiredToken = (errors: TwitterClientError[]): boolean => {
  return checkError(errors, 89);
};

/**
 * To protect our users from spam and other malicious activity, this account is temporarily locked.
 *
 * @param errors エラーリスト
 */
export const checkTemporarilyLocked = (errors: TwitterClientError[]): boolean => {
  return checkError(errors, 326);
};
