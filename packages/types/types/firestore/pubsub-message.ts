export interface GetFollowersMessage {
  /** キュータイプ */
  type: 'getFollowers';

  data: {
    /** Firebase UID */
    uid: string;

    /** カーソル */
    nextCursor: string;
  };
}

export interface CheckIntegrityMessage {
  /** キュータイプ */
  type: 'checkIntegrity';

  data: {
    /** Firebase UID */
    uid: string;
  };
}

export interface UpdateTwUsersMessage {
  /** キュータイプ */
  type: 'updateTwUsers';

  data: {
    /** Firebase UID */
    uid: string;
  };
}

export type Message = GetFollowersMessage | CheckIntegrityMessage | UpdateTwUsersMessage;

export type MessageType = Message['type'];
