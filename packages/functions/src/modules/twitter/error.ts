/**
 * @see https://developer.twitter.com/en/docs/response-codes
 */
export type TwitterError = {
  code: number;
  message: string;
};

type TwitterErrorTypes = TwitterError | TwitterError[] | { errors: TwitterError[] };

const getErrors = (error: TwitterErrorTypes): TwitterError[] => {
  if ('errors' in error) {
    return error.errors;
  }
  if (Array.isArray(error)) {
    return error;
  }
  return [error];
};

const checkError = (error: TwitterErrorTypes) => (code: number): boolean => {
  const errors = getErrors(error);
  return errors.some((error) => error.code === code);
};

export const checkNoUserMatches = (error: TwitterErrorTypes): boolean => {
  return checkError(error)(17);
};

export const checkRateLimitExceeded = (error: TwitterErrorTypes): boolean => {
  return checkError(error)(88);
};

export const checkInvalidToken = (error: TwitterErrorTypes): boolean => {
  return checkError(error)(89);
};

export const checkProtectedUser = (error: TwitterErrorTypes): boolean => {
  return checkError(error)(326);
};
