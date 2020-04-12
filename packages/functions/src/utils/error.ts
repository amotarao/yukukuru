export interface TwitterClientErrorData {
  code: number;
  message: string;
}

export const twitterClientErrorHandler = (errors: TwitterClientErrorData[]): { errors: TwitterClientErrorData[] } => {
  console.error('twitterClientErrorHandler', errors);
  return { errors };
};
