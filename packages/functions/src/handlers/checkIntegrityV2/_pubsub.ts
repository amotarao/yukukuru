export const topicName = 'checkIntegrityV2';

export type Message = {
  /** Firebase UID */
  uid: string;

  /** フォロワー数 */
  followersCount: number;

  /** 送信日時 */
  publishedAt: Date | string;
};
