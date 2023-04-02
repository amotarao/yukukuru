export const topicName = 'updateUserTwitterInfo';

export type Message = {
  /** Firebase UID */
  uid: string;

  /** Twitter ID */
  twitterId: string;

  /** 送信日時 */
  publishedAt: Date | string;
};
