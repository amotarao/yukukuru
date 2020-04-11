import { TwitterClientErrorData } from '../utils/error';

export const checkInvalidToken = (errors: TwitterClientErrorData[]): boolean => {
  const error = errors.find(({ code }) => code === 89);
  return error ? true : false;
};

export const checkRateLimitExceeded = (errors: TwitterClientErrorData[]): boolean => {
  const error = errors.find(({ code }) => code === 88);
  return error ? true : false;
};

export const checkProtectedUser = (errors: TwitterClientErrorData[]): boolean => {
  const error = errors.find(({ code }) => code === 326);
  return error ? true : false;
};
