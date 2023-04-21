export const getTwitterIdFromAccessToken = (accessToken: string): string => {
  const [twitterId] = accessToken.split('-');
  return twitterId || '';
};
