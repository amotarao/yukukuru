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

export const checkNoUserMatches = (errors: TwitterClientErrorData[]): boolean => {
  return errors.some(({ code }) => code === 17);
};

export const checkRateLimitExceeded = (errors: TwitterClientErrorData[]): boolean => {
  return errors.some(({ code }) => code === 88);
};

export const checkInvalidToken = (errors: TwitterClientErrorData[]): boolean => {
  return errors.some(({ code }) => code === 89);
};

export const checkProtectedUser = (errors: TwitterClientErrorData[]): boolean => {
  return errors.some(({ code }) => code === 326);
};
