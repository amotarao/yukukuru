import { ApiResponseError } from 'twitter-api-v2';

const logError = (error: unknown): void => {
  if (error && error instanceof ApiResponseError) {
    console.error(`❗️[Twitter Error] Failed to run Twitter API: "${error.message}", and check detail next line.`);
    console.error(`error: ${error}`);
    console.error(`data: ${JSON.stringify(error.data, null, 2)}`);
    console.error(`isAuthError: ${error.isAuthError}`);
    console.error(`rateLimitError: ${error.rateLimitError}`);
    return;
  }

  console.error(`❗️[Twitter Error] Failed to run Twitter API: check next line.`);
  console.error(error);
};

export const twitterClientErrorHandler = (error: unknown): { error: ApiResponseError } => {
  logError(error);

  if (error && error instanceof ApiResponseError) {
    return { error };
  }

  throw error;
};
