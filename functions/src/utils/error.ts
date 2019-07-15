export const twitterClientErrorHandler = (error: { code: number; message: string }[]) => {
  return { error: true, details: error };
};
