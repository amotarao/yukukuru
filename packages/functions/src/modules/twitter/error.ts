import { errorLog } from '../../utils/log';

export interface TwitterClientErrorData {
  code: number;
  message: string;
}

export const twitterClientErrorHandler = (errors: TwitterClientErrorData[]): { errors: TwitterClientErrorData[] } => {
  errorLog('twitterClientError', '', { errors });
  return { errors };
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
