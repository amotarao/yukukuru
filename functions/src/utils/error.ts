export interface TwitterClientErrorData {
  code: number;
  message: string;
}

export const twitterClientErrorHandler = (errors: TwitterClientErrorData[]): { errors: TwitterClientErrorData[] } => {
  return { errors };
};
