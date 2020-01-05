/**
 * Twitter エラーレスポンス
 * @see: https://developer.twitter.com/ja/docs/basics/response-codes
 */
export interface TwitterErrorResponse {
  code: number;
  message: string;
}

function checkHasCode(errors: TwitterErrorResponse[], code: number): boolean {
  return errors.map(({ code = 0 }) => code).includes(code);
}

/**
 * API制限を受けているかどうか
 */
export function checkRateLimitExceeded(errors: TwitterErrorResponse[]): boolean {
  return checkHasCode(errors, 88);
}

/**
 * 無効なトークンがあるかどうか
 */
export function checkInvalidToken(errors: TwitterErrorResponse[]): boolean {
  return checkHasCode(errors, 89);
}

/**
 * 凍結されているかどうか
 */
export function checkSuspendUser(errors: TwitterErrorResponse[]): boolean {
  return checkHasCode(errors, 326);
}
