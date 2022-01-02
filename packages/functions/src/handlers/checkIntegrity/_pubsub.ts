export const topicName = 'checkIntegrity';

export type Message = {
  /** Firebase UID */
  uid: string;

  /** 送信日時 */
  publishedAt: Date;
};
