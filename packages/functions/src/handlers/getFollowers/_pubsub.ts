export const topicName = 'getFollowers';

export type Message = {
  /** Firebase UID */
  uid: string;

  /** カーソル */
  nextCursor: string;

  /** 最終実行日時 */
  lastRun: Date | string;

  /** 送信日時 */
  publishedAt: Date | string;
};
