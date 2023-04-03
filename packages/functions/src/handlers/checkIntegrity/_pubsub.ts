export const topicName = 'checkIntegrity';

export type Message = {
  /** Firebase UID */
  uid: string;

  /** フォロワー数 */
  followersCount: number;

  /** 送信日時 */
  publishedAt: Date | string;
};
