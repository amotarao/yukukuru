export const topicName = 'getFollowers';

export type Message = {
  /** Firebase UID */
  uid: string;

  /** Twitter UID */
  twitterId: string;

  /**
   * カーソル
   *
   * @deprecated 廃止予定の Twitter API v1.1 ベースのフィールド
   */
  nextCursor: string;

  /** 共有トークン */
  sharedToken: {
    id: string;
    accessToken: string;
    accessTokenSecret: string;
  };

  /** 送信日時 */
  publishedAt: Date | string;
};
