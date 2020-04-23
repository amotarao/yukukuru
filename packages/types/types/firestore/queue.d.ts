export interface QueueTypeGetFollowersData {
  /** キュータイプ */
  type: 'getFollowers';

  data: {
    /** Firebase UID */
    uid: string;

    /** カーソル */
    nextCursor: string;
  };
}

export interface QueueTypeCheckIntegrityData {
  /** キュータイプ */
  type: 'checkIntegrity';

  data: {
    /** Firebase UID */
    uid: string;
  };
}

export interface QueueTypeUpdateTwUsersData {
  /** キュータイプ */
  type: 'updateTwUsers';

  data: {
    /** Firebase UID */
    uid: string;
  };
}

export type QueueData = QueueTypeGetFollowersData | QueueTypeCheckIntegrityData | QueueTypeUpdateTwUsersData;

export type QueueType = QueueData['type'];
