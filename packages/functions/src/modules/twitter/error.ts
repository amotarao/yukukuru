export interface TwitterClientErrorData {
  code: number;
  message: string;
}

export const twitterClientErrorHandler = (error: unknown): { errors: TwitterClientErrorData[] } => {
  console.error(`❗️[Twitter Error] Failed to run Twitter API.`, error);

  if (Array.isArray(error)) {
    return { errors: error as TwitterClientErrorData[] };
  }

  return { errors: [error] as TwitterClientErrorData[] };
};

/**
 * エラーコードを確認
 *
 * @param errors エラーリスト
 * @param code エラーコード
 *
 * @see https://developer.twitter.com/ja/docs/basics/response-codes
 */
const checkError = (errors, code: number) => {
  return errors.some((error) => error.code === code);
};

/**
 * No user matches for specified terms.
 *
 * @param errors エラーリスト
 */
export const checkNoUserMatches = (errors: TwitterClientErrorData[]): boolean => {
  return checkError(errors, 17);
};

/**
 * Rate limit exceeded
 *
 * @param errors エラーリスト
 */
export const checkRateLimitExceeded = (errors: TwitterClientErrorData[]): boolean => {
  return checkError(errors, 88);
};

/**
 * Invalid or expired token
 *
 * @param errors エラーリスト
 */
export const checkInvalidToken = (errors: TwitterClientErrorData[]): boolean => {
  return checkError(errors, 89);
};

/**
 * To protect our users from spam and other malicious activity, this account is temporarily locked.
 *
 * @param errors エラーリスト
 */
export const checkProtectedUser = (errors: TwitterClientErrorData[]): boolean => {
  return checkError(errors, 326);
};
