import { ApiResponseError, InlineErrorV2 } from 'twitter-api-v2';

const logError = (error: unknown): void => {
  if (error && error instanceof ApiResponseError) {
    console.error(`❗️[Twitter Error] Failed to run Twitter API: "${error.message}", and check detail next line.`);
    console.error(JSON.stringify(error));
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

const checkIsDeleted = (error: InlineErrorV2): boolean => {
  return error.detail.startsWith('Could not find user with ids:');
};

const checkIsSuspended = (error: InlineErrorV2): boolean => {
  return error.detail.startsWith('User has been suspended:');
};

export const getInlineErrorV2Type = (error: InlineErrorV2): 'deleted' | 'suspended' | 'unknown' => {
  return checkIsDeleted(error) ? 'deleted' : checkIsSuspended(error) ? 'suspended' : 'unknown';
};
