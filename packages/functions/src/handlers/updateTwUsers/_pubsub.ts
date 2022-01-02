export const topicName = 'updateTwUsers';

export type Message = {
  /** Firebase UID */
  uid: string;

  /** 送信日時 */
  publishedAt: Date;
};
