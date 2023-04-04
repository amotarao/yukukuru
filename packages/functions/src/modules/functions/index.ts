/**
 * 直前に publish されたかどうかを確認
 */
export const checkJustPublished = (
  now: string | Date,
  published: string | Date,
  diffMs: number = 1000 * 10
): boolean => {
  return new Date(now).getTime() - new Date(published).getTime() > diffMs;
};
