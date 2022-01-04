export type TokenData = {
  /** アクセストークン */
  twitterAccessToken: string;

  /** アクセストークンシークレット */
  twitterAccessTokenSecret: string;

  /**
   * Twitter UID (ユニークな数字のID)
   *
   * @deprecated 不使用に変更
   */
  twitterId?: string;
};
