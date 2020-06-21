import { errorLog } from './log';

export interface TwitterClientErrorData {
  code: number;
  message: string;
}

export const twitterClientErrorHandler = (errors: TwitterClientErrorData[]): { errors: TwitterClientErrorData[] } => {
  errorLog('twitterClientError', '', { errors });
  return { errors };
};
