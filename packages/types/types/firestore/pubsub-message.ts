export type GetFollowersMessage = {
  /** トピック名 */
  topicName: 'getFollowers';

  data: {
    /** Firebase UID */
    uid: string;

    /** カーソル */
    nextCursor: string;

    /** 最終実行日時 */
    lastRun: Date;

    /** 送信日時 */
    publishedAt: Date;
  };
};

export type CheckIntegrityMessage = {
  /** トピック名 */
  topicName: 'checkIntegrity';

  data: {
    /** Firebase UID */
    uid: string;

    /** 送信日時 */
    publishedAt: Date;
  };
};

export type UpdateTwUsersMessage = {
  /** トピック名 */
  topicName: 'updateTwUsers';

  data: {
    /** Firebase UID */
    uid: string;

    /** 送信日時 */
    publishedAt: Date;
  };
};

export type UpdateUserTwitterInfoMessage = {
  /** トピック名 */
  topicName: 'updateUserTwitterInfo';

  data: {
    /** Firebase UID */
    uid: string;

    /** 送信日時 */
    publishedAt: Date;
  };
};

export type Message = GetFollowersMessage | CheckIntegrityMessage | UpdateTwUsersMessage | UpdateUserTwitterInfoMessage;

export type MessageTopicName = Message['topicName'];
