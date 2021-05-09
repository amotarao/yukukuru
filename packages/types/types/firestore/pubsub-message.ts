export type GetFollowersMessage = {
  /** トピック */
  topic: 'getFollowers';

  data: {
    /** Firebase UID */
    uid: string;

    /** カーソル */
    nextCursor: string;

    /** 送信日時 */
    publishedAt: Date;
  };
};

export type CheckIntegrityMessage = {
  /** トピック */
  topic: 'checkIntegrity';

  data: {
    /** Firebase UID */
    uid: string;

    /** 送信日時 */
    publishedAt: Date;
  };
};

export type UpdateTwUsersMessage = {
  /** トピック */
  topic: 'updateTwUsers';

  data: {
    /** Firebase UID */
    uid: string;

    /** 送信日時 */
    publishedAt: Date;
  };
};

export type UpdateUserTwitterInfoMessage = {
  /** トピック */
  topic: 'updateUserTwitterInfo';

  data: {
    /** Firebase UID */
    uid: string;

    /** 送信日時 */
    publishedAt: Date;
  };
};

export type Message = GetFollowersMessage | CheckIntegrityMessage | UpdateTwUsersMessage | UpdateUserTwitterInfoMessage;

export type MessageTopic = Message['topic'];
