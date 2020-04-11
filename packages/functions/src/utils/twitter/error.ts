export interface TwitterClientErrorData {
  code: number;
  message: string;
}

export const checkInvalidToken = (errors: TwitterClientErrorData[]): boolean => {
  return errors.some(({ code }) => code === 89);
};

export const checkRateLimitExceeded = (errors: TwitterClientErrorData[]): boolean => {
  return errors.some(({ code }) => code === 88);
};

export const checkProtectedUser = (errors: TwitterClientErrorData[]): boolean => {
  return errors.some(({ code }) => code === 326);
};
